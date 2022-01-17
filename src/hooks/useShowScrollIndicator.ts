import useScrollPosition from 'hooks/useScrollPosition';
import { useMemo } from 'react';

// Amount in px we have to scroll to show an indicator
const THRESHOLD = 80;

/**
 * Reports if a scroll to top indicator should be visible based on
 * page scroll position
 */
const useShowScrollIndicator = () => {
  const { scrollY } = useScrollPosition();
  const isVisible = useMemo(() => !!scrollY && scrollY > THRESHOLD, [scrollY]);
  return isVisible;
};
export default useShowScrollIndicator;
