import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Suspense } from 'react';
import { getLatestSong } from '../../../services/spotify';
import { SpotifyCardWithGradient } from '../../spotify/SpotifyCardWithGradient';

const cellSx: SxObject = {
  display: 'flex',
  height: '100%',
  width: '100%',
};

async function NowPlayingAsync({ fixture }: { fixture?: Track }) {
  const track = fixture ?? (await getLatestSong().catch(() => null));
  if (!track) {
    return null;
  }

  return (
    <Box data-now-playing-hero-slot="" sx={cellSx}>
      <SpotifyCardWithGradient layout="hero" track={track} variant="nowPlaying" />
    </Box>
  );
}

/**
 * Live now-playing through the greenhouse `NowPlayingCard`. The slot only
 * fills the landscape cell; `layout="hero"` owns art, copy, and the <30rem
 * fallback. Typed `fixture` is for the gitignored preview page only.
 */
export function NowPlayingSlot({ fixture }: { fixture?: Track } = {}) {
  return (
    <Suspense fallback={null}>
      <NowPlayingAsync fixture={fixture} />
    </Suspense>
  );
}
