'use client';

import { useEffect } from 'react';

export function FooterRevealScroll() {
  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>('.collageSheet:not(.collageField)');
    const footer = document.querySelector<HTMLElement>('.chrome__footer');
    if (!sheet || !footer) {
      return;
    }

    const reducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const updateProgress = () => {
      if (reducedMotion?.matches) {
        sheet.style.setProperty('--footer-progress', '0');
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
      const raw = (window.scrollY - startScroll) / distance;
      const progress = Math.min(1, Math.max(0, raw));
      sheet.style.setProperty('--footer-progress', progress.toFixed(4));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateProgress) : null;
    observer?.observe(footer);
    observer?.observe(sheet);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      observer?.disconnect();
    };
  }, []);

  return null;
}
