import 'server-only';

import { cacheLife } from 'next/cache';

/**
 * Returns a cached server timestamp for hydration-safe relative time rendering.
 * Cached with 'minutes' profile - for relative times like "2 days ago",
 * being off by a few minutes is acceptable and avoids blocking the page.
 */
// biome-ignore lint/suspicious/useAwait: 'use cache' requires async
export async function getServerTime(): Promise<number> {
  'use cache';
  cacheLife('minutes');
  return Date.now();
}
