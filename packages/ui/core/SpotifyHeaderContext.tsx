'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

/**
 * Minimal context for sharing scroll progress between the Spotify card
 * scroll tracker and the header thumbnail. Track data is server-rendered
 * in both places — only the scroll position needs to be shared.
 *
 * Defaults to 1 (show thumbnail). The homepage scroll tracker sets it to
 * 0 when the card is visible onscreen. On non-homepage pages the tracker
 * never mounts, so the thumbnail stays visible.
 */
type SpotifyScrollContextValue = {
  /** 0 = main card visible onscreen, 1 = main card offscreen (show thumbnail) */
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
};

const SpotifyScrollContext = createContext<SpotifyScrollContextValue | null>(null);

/**
 * Provider for scroll progress state. Must wrap both the header
 * (which reads scroll progress) and the content area (which writes it).
 */
export function SpotifyScrollProvider({ children }: { children: ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(1);
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
