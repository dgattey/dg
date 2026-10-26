'use client';

import { useEffect } from 'react';

function setSheetProgress(
  sheet: HTMLElement,
  footer: HTMLElement,
  value: string,
  occluded: boolean,
) {
  if (sheet.style.getPropertyValue('--footer-progress') !== value) {
    sheet.style.setProperty('--footer-progress', value);
  }
  if (document.documentElement.style.getPropertyValue('--footer-progress') !== value) {
    document.documentElement.style.setProperty('--footer-progress', value);
  }
  if (occluded) {
    if (footer.dataset.occluded !== 'true') {
      footer.dataset.occluded = 'true';
    }
  } else if (footer.dataset.occluded) {
    delete footer.dataset.occluded;
  }
}

export function syncFooterRevealProgress() {
  const sheet = document.querySelector<HTMLElement>('.collageSheet');
  const footer = document.querySelector<HTMLElement>('.chrome__footer');
  if (!sheet || !footer) {
    return;
  }
  const footerHeight = footer.offsetHeight;
  if (footerHeight > 0) {
    const heightPx = `${footerHeight}px`;
    if (document.documentElement.style.getPropertyValue('--footer-height') !== heightPx) {
      document.documentElement.style.setProperty('--footer-height', heightPx);
    }
  }
  if (sheet.dataset.footerProgressLock) {
    setSheetProgress(
      sheet,
      footer,
      sheet.dataset.footerProgressLock,
      sheet.dataset.footerProgressLock === '0',
    );
    return;
  }
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (footerHeight <= 0 || maxScroll <= 0 || window.scrollY <= 0) {
    setSheetProgress(sheet, footer, '0', footerHeight > 0 && maxScroll > 0);
    return;
  }
  const startScroll = Math.max(0, maxScroll - footerHeight);
  const distance = Math.max(1, maxScroll - startScroll);
  const raw = maxScroll - window.scrollY <= 1 ? 1 : (window.scrollY - startScroll) / distance;
  const progress = Math.min(1, Math.max(0, raw));
  setSheetProgress(sheet, footer, progress.toFixed(4), progress === 0);
}

export function FooterRevealScroll() {
  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>('.collageSheet');
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
