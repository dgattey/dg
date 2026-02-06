'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box, keyframes } from '@mui/material';
import { ArtworkLink } from './ArtworkLink';

type AlbumImageProps = {
  track: Track;
  isPlaying?: boolean;
};

// In px, how big our rendered image is. Next resizes the API image to this constant size.
const IMAGE_SIZE = 150;

// Springy bounce animation for the album art
const albumBounce = keyframes`
  0% {
    transform: scale(1) translateY(0);
  }
  15% {
    transform: scale(1.015) translateY(-2px);
  }
  30% {
    transform: scale(0.995) translateY(0.5px);
  }
  45% {
    transform: scale(1.005) translateY(-0.5px);
  }
  60%, 100% {
    transform: scale(1) translateY(0);
  }
`;

const getWrapperSx = (isPlaying: boolean): SxObject => ({
  animation: isPlaying ? `${albumBounce} 1s cubic-bezier(0.34, 1.56, 0.64, 1) infinite` : 'none',
  willChange: isPlaying ? 'transform' : 'auto',
});

const cardSx: SxObject = {
  '--image-dim': {
    md: `${IMAGE_SIZE}px`,
    sm: `${(2 * IMAGE_SIZE) / 3}px`,
    xs: `${IMAGE_SIZE / 2}px`,
  },
  alignContent: 'center',
  alignSelf: 'flex-end',
  aspectRatio: '1 / 1',
  borderRadius: { md: 6, sm: 4, xs: 2 },
  margin: 0,
  minWidth: 'var(--image-dim)',
  overflow: 'hidden',
  padding: 0,
  position: 'relative',
  ...createBouncyTransition(['max-height', 'height']),
};

/**
 * Creates an album image that links to the album directly
 */
export function AlbumImage({ track, isPlaying }: AlbumImageProps) {
  const { album, albumImage } = track;
  const albumTitle = album.name;
  const albumUrl = album.externalUrls.spotify;

  return (
    <Box sx={getWrapperSx(Boolean(isPlaying))}>
      <ArtworkLink
        cardSx={cardSx}
        hoverScale={1.05}
        href={albumUrl}
        image={albumImage}
        imageSize={IMAGE_SIZE}
        sizes={{ extraLarge: IMAGE_SIZE }}
        title={albumTitle}
      />
    </Box>
  );
}
