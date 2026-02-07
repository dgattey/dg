'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const MIN_REFRESH_INTERVAL_MS = 5 * 1000; // 5 seconds

/**
 * Hook that refreshes the Next.js router on window focus, but only if it's been
 * longer than 5 seconds since the last refresh. This provides focus-based
 * revalidation without needing a custom REST endpoint.
 *
 * This works with Next.js App Router's server-side caching:
 * - Server Components fetch data with caching/revalidation
 * - When router.refresh() is called, it triggers a new RSC payload request
 * - The server cache is applied, giving you automatic revalidation on focus
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/use-router#refresh
 */
export function useRefreshOnFocus() {
  const router = useRouter();
  const lastRefreshTimeRef = useRef<number | null>(null);

  // Rate-limited refresh helper
  const maybeRefresh = () => {
    const now = Date.now();
    const lastRefresh = lastRefreshTimeRef.current;

    if (lastRefresh === null || now - lastRefresh >= MIN_REFRESH_INTERVAL_MS) {
      lastRefreshTimeRef.current = now;
      router.refresh();
    }
  };

  useEffect(() => {
    window.addEventListener('focus', maybeRefresh);

    return () => {
      window.removeEventListener('focus', maybeRefresh);
    };
  });
}
