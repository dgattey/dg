/**
 * useScroll React custom hook
 * Usage:
 *    const { scrollX, scrollY, scrollDirection } = useScroll();
 */

import { useEffect, useState } from 'react';

/**
 * Grabs the document's scroll X and Y
 */
const useScrollPosition = () => {
  const [bodyOffset, setBodyOffset] = useState<DOMRect | null>(null);
  const [scrollY, setScrollY] = useState(bodyOffset?.top);
  const [scrollX, setScrollX] = useState(bodyOffset?.left);

  const updateOffset = () =>
    requestAnimationFrame(() => {
      const rect = document.body.getBoundingClientRect();
      setBodyOffset(rect);
      setScrollY(-rect.top);
      setScrollX(rect.left);
    });

  useEffect(() => {
    updateOffset();
    window.addEventListener('scroll', updateOffset);
    return () => {
      window.removeEventListener('scroll', updateOffset);
    };
  }, []);

  return {
    scrollY,
    scrollX,
  };
};
export default useScrollPosition;
