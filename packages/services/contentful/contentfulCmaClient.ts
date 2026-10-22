import 'server-only';

import crypto from 'node:crypto';
import {
  type CoverImageContentType,
  DEFAULT_ENVIRONMENT_ID,
  DEFAULT_LOCALE,
  isAllowedCoverImageUrl,
  isValidContentfulEntityId,
  normalizeContentfulAssetUrl,
} from '@dg/content-models/books/bookDomain';
import {
  type NormalizedContentfulBookEntry,
  normalizeContentfulBookEntry,
} from '@dg/content-models/books/contentfulBook';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { isRecord } from '@dg/shared-core/types/typeguards';

type PublishedCoverAsset = {
  assetId: string;
  url: string;
};

class ContentfulCmaError extends Error {
  readonly status: number;
  readonly body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ContentfulCmaError';
    this.status = status;
    this.body = body;
  }
}

const getVer = (val: unknown): number =>
  isRecord(val) && isRecord(val.sys) && typeof val.sys.version === 'number' ? val.sys.version : 1;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const verHdr = (val: unknown) => ({ 'X-Contentful-Version': String(getVer(val)) });
const tryJson = (text: string): unknown => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

type ContentfulCmaClientConfig = {
  environmentId?: string;
  fetchImpl?: typeof fetch;
  locale?: string;
  managementToken: string;
  spaceId: string;
};

export class ContentfulCmaClient {
  readonly spaceId: string;
  readonly environmentId: string;
  readonly managementToken: string;
  readonly locale: string;
  readonly fetchImpl: typeof fetch;
  readonly baseUrl: string;
  readonly uploadBaseUrl: string;

  constructor(cfg: ContentfulCmaClientConfig) {
    invariant(cfg.spaceId, 'Missing CONTENTFUL_SPACE_ID');
    invariant(cfg.managementToken, 'Missing CONTENTFUL_MANAGEMENT_ACCESS_TOKEN');
    this.spaceId = cfg.spaceId;
    this.environmentId = cfg.environmentId ?? DEFAULT_ENVIRONMENT_ID;
    this.managementToken = cfg.managementToken;
    this.locale = cfg.locale ?? DEFAULT_LOCALE;
    this.fetchImpl = cfg.fetchImpl ?? fetch;
    this.baseUrl = `https://api.contentful.com/spaces/${this.spaceId}/environments/${this.environmentId}`;
    this.uploadBaseUrl = `https://upload.contentful.com/spaces/${this.spaceId}`;
  }

  private async sendWithRetry(url: string, init: RequestInit, label: string): Promise<unknown> {
    const method = init.method ?? 'GET';
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const res = await this.fetchImpl(url, init);
      if ((res.status === 429 || (res.status >= 500 && res.status < 600)) && attempt < 2) {
        const resetSec =
          Number.parseFloat(res.headers.get('x-contentful-ratelimit-reset') ?? '1') || 1;
        await sleep(res.status === 429 ? resetSec * 1000 : 2 ** attempt * 500);
        continue;
      }
      const text = await res.text();
      if (!res.ok) {
        const msg = `Contentful CMA ${method} ${label} failed (${res.status}): ${text.slice(0, 300)}`;
        throw new ContentfulCmaError(msg, res.status, tryJson(text));
      }
      return tryJson(text);
    }
    throw new Error(`Contentful CMA ${method} ${label} exhausted retries`);
  }

  request(
    path: string,
    opts: { body?: unknown; headers?: Record<string, string>; method?: string } = {},
  ): Promise<unknown> {
    const { body, headers = {}, method = 'GET' } = opts;
    return this.sendWithRetry(
      `${this.baseUrl}${path}`,
      {
        body: body !== undefined ? JSON.stringify(body) : undefined,
        headers: {
          Authorization: `Bearer ${this.managementToken}`,
          'Content-Type': 'application/vnd.contentful.management.v1+json',
          ...headers,
        },
        method,
      },
      path,
    );
  }

  async fetchAllBooks(): Promise<Array<NormalizedContentfulBookEntry>> {
    const items: Array<NormalizedContentfulBookEntry> = [];
    let skip = 0;
    while (true) {
      const page = await this.request(`/entries?content_type=book&limit=200&skip=${skip}`);
      const pageItems = isRecord(page) && Array.isArray(page.items) ? page.items : [];
      for (const entry of pageItems) {
        if (isRecord(entry)) items.push(normalizeContentfulBookEntry(entry, this.locale));
      }
      skip += pageItems.length;
      const total = isRecord(page) && typeof page.total === 'number' ? page.total : 0;
      if (pageItems.length === 0 || skip >= total) break;
    }
    return items;
  }

  async fetchBookById(entryId: string): Promise<NormalizedContentfulBookEntry | null> {
    try {
      const entry = await this.request(`/entries/${encodeURIComponent(entryId)}`);
      return isRecord(entry) ? normalizeContentfulBookEntry(entry, this.locale) : null;
    } catch (error) {
      if (error instanceof ContentfulCmaError && error.status === 404) return null;
      throw error;
    }
  }

  async fetchAssetUrl(assetId: string): Promise<string | null> {
    if (!isValidContentfulEntityId(assetId)) return null;
    try {
      const asset = await this.request(`/assets/${encodeURIComponent(assetId)}`);
      return this.extractAssetFileUrl(asset);
    } catch (error) {
      if (error instanceof ContentfulCmaError && error.status === 404) return null;
      throw error;
    }
  }

  private extractAssetFileUrl(asset: unknown): string | null {
    const fieldsRec = isRecord(asset) && isRecord(asset.fields) ? asset.fields : null;
    const f = fieldsRec && isRecord(fieldsRec.file) ? fieldsRec.file[this.locale] : null;
    return isRecord(f) ? normalizeContentfulAssetUrl(f.url) : null;
  }

  async uploadBinary(bytes: Uint8Array): Promise<string> {
    const body = new Uint8Array(bytes.byteLength);
    body.set(bytes);
    const parsed = await this.sendWithRetry(
      `${this.uploadBaseUrl}/uploads`,
      {
        body,
        headers: {
          Authorization: `Bearer ${this.managementToken}`,
          'Content-Type': 'application/octet-stream',
        },
        method: 'POST',
      },
      '/uploads',
    );
    const uploadId =
      isRecord(parsed) && isRecord(parsed.sys) && typeof parsed.sys.id === 'string'
        ? parsed.sys.id
        : null;
    if (!uploadId) {
      throw new Error('Contentful CMA upload did not return a valid sys.id');
    }
    return uploadId;
  }

  private async putProcessAndPublishAsset(opts: {
    assetId: string;
    filePayload: Record<string, unknown>;
    title?: string | null;
  }): Promise<PublishedCoverAsset> {
    const { assetId, filePayload, title } = opts;
    const fields: Record<string, unknown> = { file: { [this.locale]: filePayload } };
    if (title) fields.title = { [this.locale]: title };
    const created = await this.request(`/assets/${assetId}`, { body: { fields }, method: 'PUT' });
    await this.request(`/assets/${assetId}/files/${this.locale}/process`, {
      headers: verHdr(created),
      method: 'PUT',
    });

    for (let attempt = 0; attempt < 15; attempt += 1) {
      await sleep(attempt === 0 ? 750 : Math.min(1000 * 2 ** Math.min(attempt, 3), 8000));
      const candidate = await this.request(`/assets/${assetId}`);
      const url = this.extractAssetFileUrl(candidate);
      if (url) {
        await this.request(`/assets/${assetId}/published`, {
          headers: verHdr(candidate),
          method: 'PUT',
        });
        return { assetId, url };
      }
    }
    throw new Error(`Timed out waiting for Contentful asset ${assetId} to process`);
  }

  async createAndPublishCoverAsset(opts: {
    assetId?: string;
    imageUrl: string;
    title?: string | null;
  }): Promise<PublishedCoverAsset> {
    const { assetId = crypto.randomUUID().toUpperCase(), imageUrl, title } = opts;
    if (!isAllowedCoverImageUrl(imageUrl)) {
      throw new Error(
        `Refusing to fetch cover image from untrusted host: ${imageUrl.slice(0, 120)}`,
      );
    }

    return await this.putProcessAndPublishAsset({
      assetId,
      filePayload: {
        contentType: 'image/jpeg',
        fileName: `${assetId}.jpg`,
        upload: imageUrl,
      },
      title,
    });
  }

  async createAndPublishBinaryCoverAsset(opts: {
    assetId?: string;
    bytes: Uint8Array;
    contentType: CoverImageContentType;
    fileNameBase?: string | null;
    title?: string | null;
  }): Promise<PublishedCoverAsset> {
    const {
      assetId = crypto.randomUUID().toUpperCase(),
      bytes,
      contentType,
      fileNameBase,
      title,
    } = opts;
    const uploadId = await this.uploadBinary(bytes);
    const ext = contentType === 'image/png' ? 'png' : 'jpg';
    const baseName =
      fileNameBase && isValidContentfulEntityId(fileNameBase) ? fileNameBase.trim() : assetId;

    return await this.putProcessAndPublishAsset({
      assetId,
      filePayload: {
        contentType,
        fileName: `${baseName}.${ext}`,
        uploadFrom: {
          sys: {
            id: uploadId,
            linkType: 'Upload',
            type: 'Link',
          },
        },
      },
      title,
    });
  }

  private async putAndPublishEntry(
    entryId: string,
    fields: Record<string, unknown>,
    headers: Record<string, string>,
  ) {
    const saved = await this.request(`/entries/${entryId}`, {
      body: { fields },
      headers,
      method: 'PUT',
    });
    const published = await this.request(`/entries/${entryId}/published`, {
      headers: verHdr(saved),
      method: 'PUT',
    });
    return normalizeContentfulBookEntry(isRecord(published) ? published : {}, this.locale);
  }

  createAndPublishBook(
    fields: Record<string, unknown>,
    entryId = crypto.randomUUID().toUpperCase(),
  ) {
    return this.putAndPublishEntry(entryId, fields, { 'X-Contentful-Content-Type': 'book' });
  }

  updateAndPublishBook(entryId: string, version: number, fields: Record<string, unknown>) {
    return this.putAndPublishEntry(entryId, fields, { 'X-Contentful-Version': String(version) });
  }

  async unpublishAndDeleteBook(entryId: string): Promise<boolean> {
    if (!isValidContentfulEntityId(entryId)) throw new Error('Invalid Contentful book entry ID');
    const existing = await this.fetchBookById(entryId);
    if (!existing) return false;
    if (existing.publishedVersion !== null) {
      await this.request(`/entries/${encodeURIComponent(entryId)}/published`, {
        method: 'DELETE',
      }).catch((e) => {
        if (!(e instanceof ContentfulCmaError && e.status === 404)) throw e;
      });
    }
    await this.request(`/entries/${encodeURIComponent(entryId)}`, { method: 'DELETE' });
    return true;
  }
}
