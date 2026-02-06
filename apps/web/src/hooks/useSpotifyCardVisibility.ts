'use client';

import { useSpotifyScrollProgress } from '@dg/ui/core/SpotifyHeaderContext';
import { useEffect, useRef } from 'react';

/**
 * Tracks whether the Spotify card is visible onscreen and reports
 * progress to context. Checks both directions — the card could be
 * above the header (scrolled past) OR below the viewport (not yet
 * scrolled to). Uses a smooth transition zone at the edges.
 *
 * Semantics: 0 = card visible (hide thumbnail), 1 = card offscreen (show thumbnail).
 * On unmount (e.g. navigating away from homepage), resets to 1 so the
 * thumbnail stays visible on other pages.
 */
export function useSpotifyCardVisibility() {
  const context = useSpotifyScrollProgress();
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!context) {
      return;
    }

    const update = () => {
      const card = cardRef.current;
      if (!card) {
        return;
      }

      const header = document.querySelector('[data-site-header]');
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const rect = card.getBoundingClientRect();
      const zone = rect.height * 0.5;

      // How far below the header the card's bottom edge is
      const aboveAmount = rect.bottom - headerHeight;
      // How far above the viewport bottom the card's top edge is
      const belowAmount = window.innerHeight - rect.top;

      let progress: number;
      if (aboveAmount <= 0) {
        // Card is fully above the header → offscreen → show thumbnail
        progress = 1;
      } else if (belowAmount <= 0) {
        // Card is fully below the viewport → offscreen → show thumbnail
        progress = 1;
      } else if (aboveAmount < zone) {
        // Card is partially scrolling above → transition zone
        progress = 1 - aboveAmount / zone;
      } else if (belowAmount < zone) {
        // Card is partially entering from below → transition zone
        progress = 1 - belowAmount / zone;
      } else {
        // Card is comfortably onscreen → hide thumbnail
        progress = 0;
      }

      context.setScrollProgress(Math.max(0, Math.min(1, progress)));
    };

    const onScroll = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      // Reset to 1 (show thumbnail) when the card unmounts
      context.setScrollProgress(1);
    };
  }, [context]);

  return cardRef;
}
