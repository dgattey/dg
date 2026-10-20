'use client';

import { useLayoutEffect } from 'react';

export function SiteHeaderHeight() {
  useLayoutEffect(() => {
    const measuredElement = document.querySelector<HTMLElement>('[data-sticky-header]');
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
