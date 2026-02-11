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
import { getImageGradientInformationFromUrl } from '../images/getImageGradient';
import { getSpotifyClient } from './spotifyClient';

const CURRENTLY_PLAYING_RESOURCE = 'me/player/currently-playing';
const RECENTLY_PLAYED_RESOURCE = 'me/player/recently-played?limit=1';

/**
 * Fetches the track most relevant to "latest playback":
 * - returns the currently playing track when available
 * - falls back to the most recently played track otherwise
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
      return await withAlbumGradientInfo(track);
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
 * as `null`, or returns full JSON. Augments it with the image gradient from the URL.
 */
async function fetchLastPlayed(): Promise<null | Track> {
  const { response, status } = await getSpotifyClient().get(RECENTLY_PLAYED_RESOURCE);
  if (status !== 200) {
    return null;
  }
  const data = parseResponse(recentlyPlayedApiSchema, await response.json(), {
    kind: 'rest',
    source: 'spotify.fetchRecentlyPlayed.recentlyPlayed',
  });
  const lastItemPlayed = mapRecentlyPlayedFromApi(data).items[0];
  if (!lastItemPlayed) {
    return null;
  }

  // Augment with gradient
  const track = { ...lastItemPlayed.track, playedAt: lastItemPlayed.playedAt };
  return await withAlbumGradientInfo(track);
}

/**
 * Augments the response with gradient information for the track
 */
async function withAlbumGradientInfo(track: Track): Promise<Track> {
  const { backgroundGradient, contrastSetting } = await getImageGradientInformationFromUrl(
    track.albumImage.url,
  );
  return {
    ...track,
    albumGradient: backgroundGradient ?? undefined,
    albumGradientContrastSetting: contrastSetting ?? undefined,
  };
}
