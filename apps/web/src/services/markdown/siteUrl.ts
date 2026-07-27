import 'server-only';

import { metadataBase } from '../../app/metadata';

/**
 * Absolute site origin used in Markdown discovery files and AI hints.
 */
export function getSiteOrigin(): string {
  return metadataBase.origin;
}

/**
 * Builds an absolute URL from a site-relative path.
 */
export function absoluteUrl(pathname: string): string {
  return new URL(pathname, metadataBase).toString();
}
