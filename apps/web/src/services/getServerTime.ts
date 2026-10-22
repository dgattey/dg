import 'server-only';

import { cacheLife } from 'next/cache';

export async function getServerTime(): Promise<number> {
  'use cache';
  cacheLife('hours');
  return Date.now();
}
