import 'server-only';

import {
  currentlyPlayingApiSchema,
  mapCurrentlyPlayingFromApi,
} from '@dg/content-models/spotify/CurrentlyPlaying';
import {
  mapRecentlyPlayedFromApi,
  recentlyPlayedApiSchema,
} from '@dg/content-models/spotify/RecentlyPlayed';
import type { Track } from '@dg/content-models/spotify/Track';
import { parseResponse } from '../clients/parseResponse';
import { getImageGradientFromUrl } from '../images/getImageGradient';
import { spotifyClient } from './spotifyClient';

const CURRENTLY_PLAYING_RESOURCE = 'me/player/currently-playing';
const RECENTLY_PLAYED_RESOURCE = 'me/player/recently-played?limit=1';

/**
 * Fetches the track most relevant to "latest playback":
 * - returns the currently playing track when available
 * - falls back to the most recently played track otherwise
 */
export async function fetchRecentlyPlayed(): Promise<null | Track> {
  const { response, status } = await spotifyClient.get(CURRENTLY_PLAYING_RESOURCE);
  switch (status) {
    case 200: {
      const data = parseResponse(currentlyPlayingApiSchema, await response.json(), {
        kind: 'rest',
        source: 'spotify.fetchRecentlyPlayed.currentlyPlaying',
      });
      const mapped = mapCurrentlyPlayingFromApi(data);
      const track = mapped.item
        ? {
            ...mapped.item,
            isPlaying: mapped.isPlaying,
            progressMs: mapped.progressMs,
          }
        : null;
      if (!track) {
        return fetchLastPlayed();
      }
      return await withAlbumGradient(track);
    }
    case 204: {
      // We aren't currently playing a song but we could have recently played one
      return fetchLastPlayed();
    }
    default:
      // This could be rate limiting, or auth problems, etc.
      return null;
  }
}

/**
 * Fetches the song that last played from spotify using a valid access token.
 * May have no content, which signifies nothing is playing, which is returned
 * as `null`, or returns full JSON.
 */
async function fetchLastPlayed(): Promise<null | Track> {
  const { response, status } = await spotifyClient.get(RECENTLY_PLAYED_RESOURCE);
  if (status !== 200) {
    return null;
  }
  const data = parseResponse(recentlyPlayedApiSchema, await response.json(), {
    kind: 'rest',
    source: 'spotify.fetchRecentlyPlayed.recentlyPlayed',
  });
  const item = mapRecentlyPlayedFromApi(data).items[0];
  const track = item ? { ...item.track, playedAt: item.playedAt } : null;
  return await withAlbumGradient(track);
}

async function withAlbumGradient(track: Track | null): Promise<Track | null> {
  if (!track) {
    return null;
  }
  const gradient = await getImageGradientFromUrl(track.albumImage.url);
  return gradient
    ? { ...track, albumGradient: gradient.gradient, albumGradientIsDark: gradient.isDark }
    : track;
}
