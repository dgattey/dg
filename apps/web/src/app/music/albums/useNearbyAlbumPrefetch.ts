import { type RefObject, useEffect } from 'react';
import { albumDetailFor, hasAlbumDetail } from './albumDetailCache';

/** At most this many albums are fetched ahead of intent per page view. */
export const NEARBY_PREFETCH_BUDGET = 10;
/** Cells have to stay near the viewport this long, so scrolling past them fetches nothing. */
export const NEARBY_PREFETCH_SETTLE_MS = 400;

/**
 * Fetches the details of albums on screen or half a screen below it once scrolling settles,
 * one request at a time because server actions run one at a time and a navigation queues
 * behind them. Albums already fetched or failed are skipped and don't count toward the budget.
 */
export function useNearbyAlbumPrefetch(itemRefs: RefObject<Map<string, HTMLElement>>) {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }
    const albumIdFor = new Map([...itemRefs.current].map(([id, element]) => [element, id]));
    const near = new Set<string>();
    let budget = NEARBY_PREFETCH_BUDGET;
    let draining = false;
    let settle: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const nextNearby = () => [...near].find((id) => !hasAlbumDetail(id));
    const drain = async () => {
      draining = true;
      for (let next = nextNearby(); next && budget > 0 && !stopped; next = nextNearby()) {
        budget -= 1;
        await albumDetailFor(next);
      }
      draining = false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = albumIdFor.get(entry.target as HTMLElement);
          if (id && entry.isIntersecting) {
            near.add(id);
          } else if (id) {
            near.delete(id);
          }
        }
        clearTimeout(settle);
        settle = setTimeout(() => {
          if (!draining) {
            void drain();
          }
        }, NEARBY_PREFETCH_SETTLE_MS);
      },
      { rootMargin: '0px 0px 50% 0px' },
    );
    for (const element of albumIdFor.keys()) {
      observer.observe(element);
    }
    return () => {
      stopped = true;
      clearTimeout(settle);
      observer.disconnect();
    };
  }, [itemRefs]);
}
