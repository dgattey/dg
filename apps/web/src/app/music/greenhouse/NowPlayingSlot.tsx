import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Suspense } from 'react';
import { getLatestSong } from '../../../services/spotify';
import { SpotifyCardWithGradient } from '../../spotify/SpotifyCardWithGradient';

const heroSx: SxObject = {
  '& [data-bento="now-playing"]': {
    minHeight: { sm: 'unset' },
  },
  display: 'flex',
  height: '100%',
  minHeight: { sm: 'unset', xs: '16.5rem' },
  width: '100%',
};

async function NowPlayingAsync({ fixture }: { fixture?: Track }) {
  const track = fixture ?? (await getLatestSong().catch(() => null));
  if (!track) {
    return null;
  }

  return (
    <Box data-now-playing-hero="" sx={heroSx}>
      {/*
       * `layout="hero"` lands on `NowPlayingCard` from its owner (art large
       * right, `h2` title). Until then the card already sits art-beside-copy
       * at ≥ 13.5rem; this slot only gives it the landscape span.
       */}
      <SpotifyCardWithGradient track={track} variant="nowPlaying" />
    </Box>
  );
}

/**
 * Live now-playing through the greenhouse `NowPlayingCard` (notes, wash, art).
 * Typed `fixture` is for the gitignored preview page only.
 */
export function NowPlayingSlot({ fixture }: { fixture?: Track } = {}) {
  return (
    <Suspense fallback={null}>
      <NowPlayingAsync fixture={fixture} />
    </Suspense>
  );
}
