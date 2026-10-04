'use client';

import { useLayoutEffect } from 'react';

/**
 * Publishes the sticky header section's measured height as
 * `--site-header-height` so page-level sticky controls can sit just under it.
 * Renders nothing; measures the collage's `data-sticky-header`, else the
 * section around the classic `data-site-header`.
 */
export function SiteHeaderHeight() {
  useLayoutEffect(() => {
    const measuredElement =
      document.querySelector<HTMLElement>('[data-sticky-header]') ??
      document.querySelector<HTMLElement>('[data-site-header]')?.closest('section');
    if (!measuredElement) {
      return;
    }
    const publishHeight = () => {
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${measuredElement.getBoundingClientRect().height}px`,
      );
    };
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(measuredElement);
    return () => observer.disconnect();
  }, []);

  return null;
}
