'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { useSpotifyCardVisibility } from '../../hooks/useSpotifyCardVisibility';

/**
 * Thin client wrapper that attaches a scroll observer to the Spotify card.
 * Reports scroll progress to the shared context so the header thumbnail
 * knows when to appear.
 */
export const NOW_PLAYING_CARD_ID = 'now-playing-card';

export function SpotifyCardScrollTracker({
  children,
  sx,
}: {
  children: ReactNode;
  /** The tracker is the grid item, so grid placement belongs here. */
  sx?: SxObject;
}) {
  const cardRef = useSpotifyCardVisibility();
  return (
    <Box id={NOW_PLAYING_CARD_ID} ref={cardRef} sx={{ scrollMarginTop: 120, ...sx }}>
      {children}
    </Box>
  );
}
