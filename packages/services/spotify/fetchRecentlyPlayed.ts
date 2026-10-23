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
import { getSpotifyClient } from './spotifyClient';

const CURRENTLY_PLAYING_RESOURCE = 'me/player/currently-playing';
const RECENTLY_PLAYED_RESOURCE = 'me/player/recently-played?limit=1';
const LAST_PLAYED_CACHE_TTL_MS = 60_000;

let cachedLastPlayed: { expiresAt: number; track: Track | null } | null = null;

export function clearLastPlayedCache(): void {
  cachedLastPlayed = null;
}

/**
 * Fetches the track most relevant to "latest playback":
 * - returns the currently playing track when available
 * - falls back to the most recently played track otherwise
 *
 * Album-art gradient/contrast are derived client-side so the homepage
 * server bundle never loads sharp/libvips.
 */
export async function fetchRecentlyPlayed(): Promise<null | Track> {
  const { response, status } = await getSpotifyClient().get(CURRENTLY_PLAYING_RESOURCE);
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
      cachedLastPlayed = null;
      return track;
    }
    case 204: {
      return fetchLastPlayed();
    }
    default:
      return null;
  }
}

async function fetchLastPlayed(): Promise<null | Track> {
  const now = Date.now();
  if (cachedLastPlayed && cachedLastPlayed.expiresAt > now) {
    return cachedLastPlayed.track;
  }
  const { response, status } = await getSpotifyClient().get(RECENTLY_PLAYED_RESOURCE);
  if (status !== 200) {
    return null;
  }
  const data = parseResponse(recentlyPlayedApiSchema, await response.json(), {
    kind: 'rest',
    source: 'spotify.fetchRecentlyPlayed.recentlyPlayed',
  });
  const lastItemPlayed = mapRecentlyPlayedFromApi(data).items[0];
  const track = lastItemPlayed
    ? { ...lastItemPlayed.track, playedAt: lastItemPlayed.playedAt }
    : null;
  cachedLastPlayed = {
    expiresAt: Date.now() + LAST_PLAYED_CACHE_TTL_MS,
    track,
  };
  return track;
}
