import 'server-only';

import type { Track } from '@dg/content-models/spotify/Track';
import { Suspense } from 'react';
import { getLatestSong } from '../../../services/spotify';
import { SpotifyCardWithGradient } from '../../spotify/SpotifyCardWithGradient';

async function NowPlayingAsync({ fixture }: { fixture?: Track }) {
  if (fixture) {
    return <SpotifyCardWithGradient track={fixture} variant="nowPlaying" />;
  }

  try {
    const track = await getLatestSong();
    if (!track) {
      return null;
    }
    return <SpotifyCardWithGradient track={track} variant="nowPlaying" />;
  } catch {
    return null;
  }
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
