'use client';

import { useLayoutEffect } from 'react';

/**
 * Publishes the sticky header section's measured height as
 * `--site-header-height` so page-level sticky controls can sit just under it.
 * Renders nothing; finds the header via `data-site-header`.
 */
export function SiteHeaderHeight() {
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-site-header]');
    const section = header?.closest('section');
    if (!section) {
      return;
    }
    const publishHeight = () => {
      document.documentElement.style.setProperty(
        '--site-header-height',
        `${section.getBoundingClientRect().height}px`,
      );
    };
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return null;
}
