import 'server-only';

import type { SideProjectMark } from '@dg/content-models/contentful/renderables/sideProjects';

/**
 * Ordered icon paths on a DylKit app site. The first PNG wins.
 * `/icon.png` is the 256 px rounded PNG generated from the app icon at build time,
 * and older sites serve `/app-icon.png`, a 1024 px rounded PNG.
 */
export const APP_SITE_ICON_PATHS = ['/icon.png', '/app-icon.png'] as const;

const PNG_HEADER_BYTES = 24;

function isGatteyAppSite(siteUrl: string): boolean {
  try {
    const parsed = new URL(siteUrl);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.gattey.com');
  } catch {
    return false;
  }
}

function isPng(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a &&
    bytes[12] === 0x49 &&
    bytes[13] === 0x48 &&
    bytes[14] === 0x44 &&
    bytes[15] === 0x52
  );
}

async function readPngSize(
  body: ReadableStream<Uint8Array>,
): Promise<{ height: number; width: number } | null> {
  const reader = body.getReader();
  const bytes = new Uint8Array(PNG_HEADER_BYTES);
  let offset = 0;
  try {
    while (offset < bytes.length) {
      const { done, value } = await reader.read();
      if (value != null && value.byteLength > 0) {
        const take = Math.min(value.byteLength, bytes.length - offset);
        bytes.set(value.subarray(0, take), offset);
        offset += take;
      }
      if (done || offset >= bytes.length) {
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }
  if (offset < bytes.length || !isPng(bytes)) {
    return null;
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return {
    height: view.getUint32(20),
    width: view.getUint32(16),
  };
}

/**
 * Loads the live icon for a `*.gattey.com` app site.
 * Returns null for any other URL, and when no registered path serves a PNG.
 */
export async function fetchAppSiteIcon(siteUrl: string): Promise<SideProjectMark | null> {
  if (!isGatteyAppSite(siteUrl)) {
    return null;
  }
  for (const path of APP_SITE_ICON_PATHS) {
    try {
      const iconUrl = new URL(path, siteUrl);
      const response = await fetch(iconUrl, {
        headers: { Range: 'bytes=0-23' },
        signal: AbortSignal.timeout(3000),
      });
      if (response.status !== 200 && response.status !== 206) {
        await response.body?.cancel();
        continue;
      }
      if (response.body == null) {
        continue;
      }
      const size = await readPngSize(response.body);
      if (size == null) {
        continue;
      }
      return {
        height: size.height,
        title: null,
        url: iconUrl.toString(),
        width: size.width,
      };
    } catch {}
  }
  return null;
}
