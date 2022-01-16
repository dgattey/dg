import { useThrottleCallback } from '@react-hook/throttle';
import { useEffect, useState } from 'react';

/**
 * Reports the document's X and Y offset, with a delay
 */
const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  // Updates the offset with a resolution of 15 FPS for best performance
  const updateOffset = useThrottleCallback(() => {
    const rect = document.body.getBoundingClientRect();
    setScrollY(-rect.top);
    setScrollX(rect.left);
  }, 15);

  // Attach to the window's scroll listener
  useEffect(() => {
    updateOffset();
    window.addEventListener('scroll', updateOffset);
    return () => {
      window.removeEventListener('scroll', updateOffset);
    };
  }, [updateOffset]);

  return {
    scrollY,
    scrollX,
  };
};
export default useScrollPosition;
