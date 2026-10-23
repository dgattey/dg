'use client';

import { setViewTransitionScrollOffset } from '@dg/ui/core/transitions/pageScrollMemory';
import { useEffect } from 'react';

export function syncFooterRevealProgress() {
  setViewTransitionScrollOffset(window.scrollY);
  const sheet = document.querySelector<HTMLElement>(
    '.collageRoot > .collageSheet, .collageSheet:not(.collageBackdrop .collageSheet)',
  );
  const footer = document.querySelector<HTMLElement>('.chrome__footer');
  if (!sheet || !footer) {
    return;
  }
  if (sheet.dataset.footerProgressLock) {
    sheet.style.setProperty('--footer-progress', sheet.dataset.footerProgressLock);
    return;
  }
  const footerHeight = footer.offsetHeight;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (footerHeight <= 0 || maxScroll <= 0 || window.scrollY <= 0) {
    sheet.style.setProperty('--footer-progress', '0');
    return;
  }
  const startScroll = Math.max(0, maxScroll - footerHeight);
  const distance = Math.max(1, maxScroll - startScroll);
  const raw = maxScroll - window.scrollY <= 1 ? 1 : (window.scrollY - startScroll) / distance;
  const progress = Math.min(1, Math.max(0, raw));
  sheet.style.setProperty('--footer-progress', progress.toFixed(4));
}

export function FooterRevealScroll() {
  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>(
      '.collageRoot > .collageSheet, .collageSheet:not(.collageBackdrop .collageSheet)',
    );
    const footer = document.querySelector<HTMLElement>('.chrome__footer');
    if (!sheet || !footer) {
      return;
    }

    const onResize = () => {
      if (document.documentElement.matches(':active-view-transition')) {
        return;
      }
      syncFooterRevealProgress();
    };

    syncFooterRevealProgress();
    window.addEventListener('scroll', syncFooterRevealProgress, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    observer?.observe(footer);
    observer?.observe(sheet);
    observer?.observe(document.documentElement);
    return () => {
      window.removeEventListener('scroll', syncFooterRevealProgress);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
    };
  }, []);

  return null;
}
