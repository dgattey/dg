import { useInView } from 'react-intersection-observer';

/**
 * Using IntersectionObserver, returns if we've scrolled far enough down
 * the page to trigger a scroll indicator to show up. Uses a ref-passed
 * height to compute where it should swap. Should be the height of the
 * header.
 */
const useShowScrollIndicator = (thresholdHeight: number) => {
  const { ref, inView } = useInView({
    threshold: 1.0,
    rootMargin: `-${thresholdHeight}px`,
  });
  return { ref, isIndicatorShown: !inView };
};

export default useShowScrollIndicator;
