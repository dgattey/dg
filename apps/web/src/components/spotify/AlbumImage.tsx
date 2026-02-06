'use client';

import type { Track } from '@dg/content-models/spotify/Track';
import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { ArtworkLink } from './ArtworkLink';
import { useWaveformBounce } from './useWaveformBounce';

type AlbumImageProps = {
  track: Track;
  isPlaying: boolean;
};

// In px, how big our rendered image is
const IMAGE_SIZE = 150;

const wrapperSx: SxObject = {
  backfaceVisibility: 'hidden',
  position: 'relative',
  zIndex: 2, // Above notes layer
};

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
 * Album image with waveform bounce animation when playing.
 */
export function AlbumImage({ track, isPlaying }: AlbumImageProps) {
  const { album, albumImage } = track;
  const albumTitle = album.name;
  const albumUrl = album.externalUrls.spotify;

  const bounceRef = useWaveformBounce<HTMLDivElement>({ isPlaying });

  return (
    <Box ref={bounceRef} sx={wrapperSx}>
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
