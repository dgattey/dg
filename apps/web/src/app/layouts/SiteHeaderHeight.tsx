'use client';

import { useLayoutEffect } from 'react';

const pixels = (value: string) => Number.parseFloat(value) || 0;

/**
 * Publishes the sticky header's height, and how far it tucks up so only the row holding
 * the `data-sticky-header-row` pieces stays pinned while anything wrapped above it scrolls away.
 */
export function SiteHeaderHeight() {
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-sticky-header]');
    if (!header) {
      return;
    }
    const bar = header.querySelector<HTMLElement>('.chrome__bar');
    const publish = () => {
      const rawHeaderBox = header.getBoundingClientRect();
      const boxEl = rawHeaderBox.height > 0 ? header : (bar ?? header);
      const headerBox = boxEl.getBoundingClientRect();
      const rowTops = [...header.querySelectorAll<HTMLElement>('[data-sticky-header-row]')].map(
        (piece) => piece.getBoundingClientRect().top - pixels(getComputedStyle(piece).marginTop),
      );
      const tuck =
        rawHeaderBox.height > 0 && rowTops.length > 0
          ? Math.max(
              0,
              Math.round(
                Math.min(...rowTops) - headerBox.top - pixels(getComputedStyle(header).paddingTop),
              ),
            )
          : 0;
      document.documentElement.style.setProperty('--site-header-tuck', `${tuck}px`);
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${headerBox.height - tuck}px`,
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    if (bar) {
      observer.observe(bar);
    }
    return () => observer.disconnect();
  }, []);

  return null;
}
