import 'server-only';

import { db } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';

const GITHUB_REPOSITORY = 'dgattey/dg';
export const GITHUB_REPOSITORY_URL = `https://github.com/${GITHUB_REPOSITORY}`;
const RELEASES_PER_PAGE = 100;
const MAX_RELEASE_PAGES = 10;

export type ReleaseKind = 'major' | 'minor' | 'patch';

export type ChangelogRelease = {
  htmlUrl: string;
  kind: ReleaseKind;
  major: number;
  minor: number;
  name: string;
  notes: ReadonlyArray<string>;
  patch: number;
  prNumbers: ReadonlyArray<number>;
  publishedAt: string | null;
  tag: string;
  version: string;
};

type RawGitHubRelease = {
  body?: string | null;
  draft?: boolean;
  html_url?: string;
  name?: string | null;
  prerelease?: boolean;
  published_at?: string | null;
  tag_name?: string;
};

export function parseSemverTag(
  tagName: string,
): { kind: ReleaseKind; major: number; minor: number; patch: number; version: string } | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(tagName.trim());
  if (!match) {
    return null;
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  const kind: ReleaseKind =
    minor === 0 && patch === 0 && major > 0 ? 'major' : patch === 0 ? 'minor' : 'patch';
  return {
    kind,
    major,
    minor,
    patch,
    version: `${major}.${minor}.${patch}`,
  };
}

function cleanNoteLine(line: string): string {
  return line
    .replace(/^[-*]\s+/, '')
    .replace(/\[#(\d+)\]\(https:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/\1\)/g, '#$1')
    .replace(
      /\[([^\]]+)\]\(https:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/(\d+)\)/g,
      '$1 (#$2)',
    )
    .replace(/\bhttps:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/(\d+)\b/g, '#$1')
    .replace(/\s*\(\[[0-9a-f]{7,40}\]\(https:\/\/github\.com\/[^)]+\)\)/gi, '')
    .replace(/\s+by\s+@[a-z0-9-]+\s+in\s+(?=#\d+\b)/gi, ' ')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$1')
    .replace(/\*\*|`/g, '')
    .replace(/\s+/g, ' ')
    .replace(/:$/, '')
    .trim();
}

export function extractPrNumbers(text: string): Array<number> {
  const numbers = new Set<number>();
  const pattern =
    /(?:https:\/\/github\.com\/dgattey\/dg\/(?:pull|issues)\/(\d+)|(?<![a-z0-9])#(\d+)\b)/gi;
  for (const match of text.matchAll(pattern)) {
    const raw = match[1] ?? match[2];
    const parsed = raw ? Number(raw) : Number.NaN;
    if (Number.isInteger(parsed) && parsed > 0) {
      numbers.add(parsed);
    }
  }
  return [...numbers];
}

/**
 * Extracts plain-text bullet items and linked PR numbers from a release body.
 */
export function parseReleaseBody(body: string | null | undefined): {
  notes: Array<string>;
  prNumbers: Array<number>;
} {
  if (!body) {
    return { notes: [], prNumbers: [] };
  }

  const withoutComments = body
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<img\b[^>]*>/gi, '');

  const prNumbers = extractPrNumbers(withoutComments);
  const notes: Array<string> = [];

  for (const rawLine of withoutComments.split('\n')) {
    const trimmed = rawLine.trim();
    if (
      !trimmed ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('![') ||
      trimmed.startsWith('|') ||
      trimmed.startsWith('**Full Changelog**') ||
      /^(?:Closes|Fixes|Resolves)\s+[A-Z]+-\d+/i.test(trimmed) ||
      /^\s{2,}[-*]\s+/.test(rawLine)
    ) {
      continue;
    }

    if (/^[-*]\s+/.test(rawLine) || notes.length === 0) {
      const cleaned = cleanNoteLine(trimmed);
      if (cleaned && !notes.includes(cleaned)) {
        notes.push(cleaned);
      }
    }
  }

  return { notes: notes.slice(0, 8), prNumbers };
}

export function normalizeGitHubRelease(raw: RawGitHubRelease): ChangelogRelease | null {
  if (raw.draft || raw.prerelease || !raw.tag_name) {
    return null;
  }
  const semver = parseSemverTag(raw.tag_name);
  if (!semver) {
    return null;
  }
  const tag = `v${semver.version}`;
  const { notes, prNumbers } = parseReleaseBody(raw.body);
  return {
    htmlUrl: raw.html_url || `${GITHUB_REPOSITORY_URL}/releases/tag/${tag}`,
    kind: semver.kind,
    major: semver.major,
    minor: semver.minor,
    name: raw.name?.trim() || tag,
    notes,
    patch: semver.patch,
    prNumbers,
    publishedAt: raw.published_at ?? null,
    tag,
    version: semver.version,
  };
}

export function createFallbackRelease(fallbackVersion: string): ChangelogRelease {
  const semver = parseSemverTag(fallbackVersion) ?? {
    kind: 'patch' as const,
    major: 2,
    minor: 0,
    patch: 0,
    version: fallbackVersion.replace(/^v/, ''),
  };
  const tag = `v${semver.version}`;
  return {
    htmlUrl: `${GITHUB_REPOSITORY_URL}/releases/tag/${tag}`,
    kind: semver.kind,
    major: semver.major,
    minor: semver.minor,
    name: tag,
    notes: [],
    patch: semver.patch,
    prNumbers: [],
    publishedAt: null,
    tag,
    version: semver.version,
  };
}

export function compareReleasesDesc(a: ChangelogRelease, b: ChangelogRelease): number {
  if (a.major !== b.major) return b.major - a.major;
  if (a.minor !== b.minor) return b.minor - a.minor;
  return b.patch - a.patch;
}

export async function upsertRelease(input: {
  body: string;
  publishedAt: Date | string;
  url: string;
  version: string;
}): Promise<ChangelogRelease | null> {
  const semver = parseSemverTag(input.version);
  if (!semver) {
    return null;
  }
  const tag = `v${semver.version}`;
  const publishedDate =
    input.publishedAt instanceof Date ? input.publishedAt : new Date(input.publishedAt);
  const validPublishedDate = Number.isNaN(publishedDate.getTime()) ? new Date() : publishedDate;
  const url = input.url.trim() || `${GITHUB_REPOSITORY_URL}/releases/tag/${tag}`;
  const body = input.body.trim();

  await db.Release.upsert({
    body,
    publishedAt: validPublishedDate,
    url,
    version: tag,
  });

  return normalizeGitHubRelease({
    body,
    html_url: url,
    name: tag,
    published_at: validPublishedDate.toISOString(),
    tag_name: tag,
  });
}

async function fetchReleasesFromDatabase(): Promise<Array<ChangelogRelease>> {
  try {
    const rows = await db.Release.findAll({
      order: [['publishedAt', 'DESC']],
    });
    const parsed: Array<ChangelogRelease> = [];
    for (const row of rows) {
      const release = normalizeGitHubRelease({
        body: row.body,
        html_url: row.url,
        name: row.version,
        published_at:
          row.publishedAt instanceof Date ? row.publishedAt.toISOString() : String(row.publishedAt),
        tag_name: row.version,
      });
      if (release) {
        parsed.push(release);
      }
    }
    return parsed;
  } catch (error) {
    log.warn('Database releases read failed, falling back to GitHub API', { error });
    return [];
  }
}

/**
 * Reads published releases from Postgres (`"Release"` table), falling back to
 * the GitHub Releases API only when the table is empty or unreachable.
 */
export async function fetchReleases(options?: {
  fallbackVersion?: string;
}): Promise<Array<ChangelogRelease>> {
  const fallbackVersion = options?.fallbackVersion ?? '2.80.1';
  const collected: Array<ChangelogRelease> = [];
  const seenTags = new Set<string>();

  const dbReleases = await fetchReleasesFromDatabase();
  for (const release of dbReleases) {
    if (!seenTags.has(release.tag)) {
      seenTags.add(release.tag);
      collected.push(release);
    }
  }

  if (collected.length === 0) {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'dylangattey-web',
    };

    try {
      for (let page = 1; page <= MAX_RELEASE_PAGES; page += 1) {
        const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`;
        const response = await fetch(url, {
          cache: 'no-store',
          headers,
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) {
          log.warn('GitHub releases fetch returned non-OK status', {
            page,
            status: response.status,
          });
          break;
        }
        const payload = (await response.json()) as unknown;
        if (!Array.isArray(payload) || payload.length === 0) {
          break;
        }
        for (const item of payload) {
          if (item && typeof item === 'object') {
            const parsed = normalizeGitHubRelease(item as RawGitHubRelease);
            if (parsed && !seenTags.has(parsed.tag)) {
              seenTags.add(parsed.tag);
              collected.push(parsed);
            }
          }
        }
        if (payload.length < RELEASES_PER_PAGE) {
          break;
        }
      }
    } catch (error) {
      log.warn('GitHub releases fetch failed, using fallback version', { error });
    }
  }

  const fallback = createFallbackRelease(fallbackVersion);
  if (!seenTags.has(fallback.tag)) {
    collected.push(fallback);
  }

  return collected.sort(compareReleasesDesc);
}
