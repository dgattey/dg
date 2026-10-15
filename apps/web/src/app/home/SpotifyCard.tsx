import 'server-only';

import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { getLastKnownSong } from '../../services/spotify';
import { SpotifyCardWithGradient } from '../spotify/SpotifyCardWithGradient';
import { SpotifyCollageCard } from '../spotify/SpotifyCollageCard';

/**
 * Async data-fetching wrapper. Reads the cached last-known song (`cacheLife('minutes')`)
 * so the Spotify card is baked into the homepage static shell, and updates live via
 * `NowPlayingContext` when `LiveNowPlaying` streams in.
 */
export async function SpotifyCardAsync({ surface = 'classic' }: { surface?: SiteSurface }) {
  const track = await getLastKnownSong();
  if (surface === 'collage') {
    return <SpotifyCollageCard track={track} />;
  }
  if (!track) {
    return null;
  }
  return <SpotifyCardWithGradient track={track} />;
}

/**
 * Public entry point for the Spotify card on the homepage.
 */
export function SpotifyCardSlot({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  return <SpotifyCardAsync surface={surface} />;
}
