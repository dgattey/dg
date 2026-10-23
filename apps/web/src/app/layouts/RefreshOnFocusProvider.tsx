'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

const MIN_REFRESH_INTERVAL_MS = 5 * 1000;

/**
 * Refreshes the Next.js router when the window regains focus (at most once every
 * 5 seconds), triggering RSC revalidation to keep server-fetched data fresh.
 */
export function RefreshOnFocusProvider() {
  const router = useRouter();
  const lastRefreshTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const maybeRefresh = () => {
      const now = Date.now();
      const lastRefresh = lastRefreshTimeRef.current;

      if (lastRefresh === null || now - lastRefresh >= MIN_REFRESH_INTERVAL_MS) {
        lastRefreshTimeRef.current = now;
        router.refresh();
      }
    };

    window.addEventListener('focus', maybeRefresh);
    return () => {
      window.removeEventListener('focus', maybeRefresh);
    };
  }, [router]);

  return null;
}
