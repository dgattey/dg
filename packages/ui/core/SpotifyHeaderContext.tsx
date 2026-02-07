'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

/**
 * Minimal context for sharing scroll progress between the Spotify card
 * scroll tracker and the header thumbnail. Track data is server-rendered
 * in both places — only the scroll position needs to be shared.
 *
 * - `null` = scroll tracker hasn't measured yet (home page starts hidden)
 * - `0` = main card visible onscreen (hide thumbnail)
 * - `1` = main card offscreen (show thumbnail)
 *
 * On non-homepage pages the tracker never mounts, so scrollProgress stays
 * null and consumers default to showing the thumbnail.
 */
type SpotifyScrollContextValue = {
  /** null = not measured, 0 = card visible, 1 = card offscreen */
  scrollProgress: number | null;
  setScrollProgress: (progress: number | null) => void;
};

const SpotifyScrollContext = createContext<SpotifyScrollContextValue | null>(null);

/**
 * Provider for scroll progress state. Must wrap both the header
 * (which reads scroll progress) and the content area (which writes it).
 */
export function SpotifyScrollProvider({ children }: { children: ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState<number | null>(null);
  return (
    <SpotifyScrollContext.Provider value={{ scrollProgress, setScrollProgress }}>
      {children}
    </SpotifyScrollContext.Provider>
  );
}

/**
 * Returns scroll progress context, or null if outside the provider.
 */
export function useSpotifyScrollProgress() {
  return useContext(SpotifyScrollContext);
}
