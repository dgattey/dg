import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { Suspense } from 'react';
import { getLatestSong } from '../../../services/spotify';
import { SpotifyCardWithGradient } from '../../spotify/SpotifyCardWithGradient';

async function NowPlayingAsync({ fixture }: { fixture?: Track }) {
  const track = fixture ?? (await getLatestSong().catch(() => null));
  if (!track) {
    return null;
  }

  return <SpotifyCardWithGradient layout="hero" track={track} variant="nowPlaying" />;
}

/**
 * Live now-playing through the greenhouse `NowPlayingCard`. The grid cell
 * owns the landscape span; `layout="hero"` owns art, copy, and the <30rem
 * fallback. Typed `fixture` is for the gitignored preview page only.
 */
export function NowPlayingSlot({ fixture }: { fixture?: Track } = {}) {
  return (
    <Suspense fallback={null}>
      <NowPlayingAsync fixture={fixture} />
    </Suspense>
  );
}
