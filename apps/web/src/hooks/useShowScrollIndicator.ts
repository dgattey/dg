'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Using IntersectionObserver, returns if we've scrolled far enough down
 * the page to trigger a scroll indicator to show up. Uses a ref-passed
 * height to compute where it should swap. Should be the height of the
 * header.
 */
export const useShowScrollIndicator = (thresholdHeight: number) => {
  const { ref, inView, entry } = useInView({
    rootMargin: `-${thresholdHeight}px 0px 0px 0px`,
    threshold: 1.0,
  });

  // Check initial scroll position on mount for when page loads already scrolled
  // (e.g., after refresh). The IntersectionObserver may not fire if the element
  // was never visible, so we need this fallback. Uses a small threshold (100px)
  // to detect meaningful scroll, runs only once on mount.
  const [scrolledOnLoad, setScrolledOnLoad] = useState(false);
  useEffect(() => {
    setScrolledOnLoad(window.scrollY > 100);
  }, []);

  // Use observer result if available, otherwise fall back to initial scroll check
  const isIndicatorShown = entry ? thresholdHeight > 0 && !inView : scrolledOnLoad;

  return {
    isIndicatorShown,
    ref,
  };
};
