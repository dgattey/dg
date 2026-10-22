#!/usr/bin/env node
// Usage: node contentful-side-projects.mjs inspect
//        node contentful-side-projects.mjs apply <plan.json>
// Reads Contentful tokens from ~/repos/dg/.env and never prints them.
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join } from 'node:path';

const env = Object.fromEntries(
  readFileSync(join(homedir(), 'repos/dg/.env'), 'utf8')
    .split('\n')
    .map((line) => line.match(/^([A-Z0-9_]+)=(.*)$/))
    .filter(Boolean)
    .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, '')]),
);
const SPACE = env.CONTENTFUL_SPACE_ID;
const CMA = env.CONTENTFUL_MANAGEMENT_ACCESS_TOKEN;
for (const [name, value] of Object.entries({ CMA, SPACE })) {
  if (!value) throw new Error(`missing ${name} in ~/repos/dg/.env`);
}
const LOCALE = 'en-US';
const base = `https://api.contentful.com/spaces/${SPACE}/environments/master`;
const headers = { Authorization: `Bearer ${CMA}`, 'Content-Type': 'application/vnd.contentful.management.v1+json' };

async function cma(path, init = {}) {
  const response = await fetch(path.startsWith('https://') ? path : `${base}${path}`, {
    ...init,
    headers: { ...headers, ...init.headers },
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`${init.method ?? 'GET'} ${path} -> ${response.status} ${body.message ?? ''}`);
  return body;
}

const plain = (node) => (node?.value ?? '') + (node?.content ?? []).map(plain).join('');
const local = (fields) =>
  Object.fromEntries(
    Object.entries(fields ?? {}).map(([key, value]) => {
      const inner = value[LOCALE];
      if (inner?.nodeType === 'document') return [key, `[rich text] ${plain(inner)}`];
      if (inner?.sys) return [key, `[link ${inner.sys.linkType} ${inner.sys.id}]`];
      return [key, inner];
    }),
  );
const meta = (item) => `${item.sys.type} ${item.sys.id} version=${item.sys.version} published=${item.sys.publishedVersion ?? '-'}`;

async function inspect() {
  const { items: projects } = await cma('/entries?content_type=project&fields.isSideProject=true&limit=50');
  for (const project of projects) {
    console.log(`== ${meta(project)}`);
    console.log(JSON.stringify(local(project.fields), null, 2));
    for (const key of ['link', 'thumbnail']) {
      const target = project.fields[key]?.[LOCALE]?.sys;
      if (!target) continue;
      const linked = await cma(`/${target.linkType === 'Asset' ? 'assets' : 'entries'}/${target.id}`);
      const fields = local(linked.fields);
      if (fields.file) fields.file = { contentType: fields.file.contentType, details: fields.file.details, fileName: fields.file.fileName, url: fields.file.url };
      console.log(`  ${key}: ${meta(linked)} ${JSON.stringify(fields)}`);
    }
  }
  for (const query of ['Photos', 'Sconeos', 'Scone', 'Saga']) {
    const { items } = await cma(`/entries?query=${encodeURIComponent(query)}&limit=20&select=sys.id,sys.contentType,sys.version,sys.publishedVersion,fields.title,fields.name,fields.slug,fields.url`);
    console.log(`== search ${query}: ${items.map((item) => `${item.sys.contentType.sys.id}:${item.sys.id}:${JSON.stringify(local(item.fields))}`).join(' | ') || 'none'}`);
    const assets = await cma(`/assets?query=${encodeURIComponent(query)}&limit=20`);
    console.log(`== asset search ${query}: ${assets.items.map((asset) => `${asset.sys.id}:${asset.fields.title?.[LOCALE]}:${asset.fields.file?.[LOCALE]?.fileName}`).join(' | ') || 'none'}`);
  }
}

async function replaceAsset({ assetId, file, title, expectedVersion }) {
  const asset = await cma(`/assets/${assetId}`);
  if (asset.sys.version !== expectedVersion) throw new Error(`asset ${assetId} is at version ${asset.sys.version}, expected ${expectedVersion}`);
  const bytes = readFileSync(file);
  const upload = await cma(`https://upload.contentful.com/spaces/${SPACE}/uploads`, {
    body: bytes,
    headers: { 'Content-Type': 'application/octet-stream' },
    method: 'POST',
  });
  const fields = {
    ...asset.fields,
    file: {
      [LOCALE]: {
        contentType: 'image/png',
        fileName: basename(file),
        uploadFrom: { sys: { id: upload.sys.id, linkType: 'Upload', type: 'Link' } },
      },
    },
    ...(title ? { title: { [LOCALE]: title } } : {}),
  };
  const updated = await cma(`/assets/${assetId}`, {
    body: JSON.stringify({ fields }),
    headers: { 'X-Contentful-Version': String(asset.sys.version) },
    method: 'PUT',
  });
  await cma(`/assets/${assetId}/files/${LOCALE}/process`, {
    headers: { 'X-Contentful-Version': String(updated.sys.version) },
    method: 'PUT',
  });
  let processed = updated;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    processed = await cma(`/assets/${assetId}`);
    if (processed.fields.file?.[LOCALE]?.url) break;
  }
  if (!processed.fields.file?.[LOCALE]?.url) throw new Error(`asset ${assetId} did not finish processing`);
  const published = await cma(`/assets/${assetId}/published`, {
    headers: { 'X-Contentful-Version': String(processed.sys.version) },
    method: 'PUT',
  });
  const result = published.fields.file[LOCALE];
  console.log(`asset ${assetId} published v${published.sys.publishedVersion} ${result.fileName} ${result.details?.image?.width}x${result.details?.image?.height} ${result.details?.size}B https:${result.url}`);
}

async function patchEntry({ entryId, fields: patch, expectedVersion }) {
  const entry = await cma(`/entries/${entryId}`);
  if (entry.sys.version !== expectedVersion) throw new Error(`entry ${entryId} is at version ${entry.sys.version}, expected ${expectedVersion}`);
  const fields = { ...entry.fields };
  for (const [key, value] of Object.entries(patch)) fields[key] = { ...fields[key], [LOCALE]: value };
  const updated = await cma(`/entries/${entryId}`, {
    body: JSON.stringify({ fields }),
    headers: { 'X-Contentful-Version': String(entry.sys.version) },
    method: 'PUT',
  });
  const published = await cma(`/entries/${entryId}/published`, {
    headers: { 'X-Contentful-Version': String(updated.sys.version) },
    method: 'PUT',
  });
  console.log(`entry ${entryId} published v${published.sys.publishedVersion} ${JSON.stringify(local(published.fields))}`);
}

const [mode, planPath] = process.argv.slice(2);
if (mode === 'inspect') {
  await inspect();
} else if (mode === 'apply') {
  const plan = JSON.parse(readFileSync(planPath, 'utf8'));
  for (const step of plan.assets ?? []) await replaceAsset({ ...step, file: join(dirname(planPath), step.file) });
  for (const step of plan.entries ?? []) await patchEntry(step);
  await inspect();
} else {
  throw new Error('mode must be inspect or apply');
}
