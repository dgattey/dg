'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

/**
 * Minimal context for sharing scroll progress between a content element
 * and a header component. Allows showing/hiding header elements based on
 * whether content is visible onscreen.
 *
 * - `null` = scroll tracker hasn't measured yet
 * - `0` = tracked element visible onscreen
 * - `1` = tracked element offscreen
 *
 * When no tracker mounts, scrollProgress stays null and consumers can
 * choose their default behavior.
 */
type PageScrollContextValue = {
  /** null = not measured, 0 = element visible, 1 = element offscreen */
  scrollProgress: number | null;
  setScrollProgress: (progress: number | null) => void;
};

const PageScrollContext = createContext<PageScrollContextValue | null>(null);

/**
 * Provider for scroll progress state. Must wrap both the header
 * (which reads scroll progress) and the content area (which writes it).
 */
export function PageScrollProvider({ children }: { children: ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState<number | null>(null);
  return (
    <PageScrollContext.Provider value={{ scrollProgress, setScrollProgress }}>
      {children}
    </PageScrollContext.Provider>
  );
}

/**
 * Returns scroll progress context, or null if outside the provider.
 */
export function usePageScrollProgress() {
  return useContext(PageScrollContext);
}
