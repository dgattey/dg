'use client';

import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { useSpotifyCardVisibility } from '../../hooks/useSpotifyCardVisibility';

/**
 * Thin client wrapper that attaches a scroll observer to the Spotify card.
 * Reports scroll progress to the shared context so the header thumbnail
 * knows when to appear.
 */
export const NOW_PLAYING_CARD_ID = 'now-playing-card';

export function SpotifyCardScrollTracker({ children }: { children: ReactNode }) {
  const cardRef = useSpotifyCardVisibility();
  return (
    <Box id={NOW_PLAYING_CARD_ID} ref={cardRef} sx={{ scrollMarginTop: 120 }}>
      {children}
    </Box>
  );
}
