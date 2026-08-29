'use client';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { useLayoutEffect } from 'react';

/**
 * Publishes the sticky header section's measured height as
 * `--site-header-height` so page-level sticky controls can sit just under it.
 * Renders nothing; finds the header via `data-site-header`.
 */
export function SiteHeaderHeight({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-site-header]');
    const measuredElement = surface === 'collage' ? header : header?.closest('section');
    if (!header || !measuredElement) {
      return;
    }
    const staticCollageHeader = window.matchMedia('(max-width: 480px)');
    const publishHeight = () => {
      const height =
        surface === 'collage' && staticCollageHeader.matches
          ? 0
          : measuredElement.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--site-header-height', `${height}px`);
    };
    publishHeight();
    const observer = new ResizeObserver(publishHeight);
    observer.observe(measuredElement);
    staticCollageHeader.addEventListener('change', publishHeight);
    return () => {
      observer.disconnect();
      staticCollageHeader.removeEventListener('change', publishHeight);
    };
  }, [surface]);

  return null;
}
