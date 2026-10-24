'use client';

import { useLayoutEffect } from 'react';

export function SiteHeaderHeight() {
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-sticky-header]');
    if (!header) {
      return;
    }
    const publish = () => {
      const headerBox = header.getBoundingClientRect();
      const row = header.querySelector<HTMLElement>('[data-sticky-header-row]');
      const tuck = row
        ? Math.max(
            0,
            Math.round(
              row.getBoundingClientRect().top -
                headerBox.top -
                Number.parseFloat(getComputedStyle(header).paddingTop) -
                Number.parseFloat(getComputedStyle(row).marginTop),
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
    return () => observer.disconnect();
  }, []);

  return null;
}
