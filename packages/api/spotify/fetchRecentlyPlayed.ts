import type { CurrentlyPlaying } from './CurrentlyPlaying';
import type { RecentlyPlayed } from './RecentlyPlayed';
import type { Track } from './Track';
import { spotifyClient } from './spotifyClient';

const CURRENTLY_PLAYING_RESOURCE = 'me/player/currently-playing';
const RECENTLY_PLAYED_RESOURCE = 'me/player/recently-played?limit=1';

/**
 * Fetches the currently playing track from spotify using a valid access token.
 * May have no content, which signifies nothing is playing, which is returned
 * as `null`, or returns full JSON.
 */
export async function fetchRecentlyPlayed(): Promise<null | Track> {
  const { response, status } = await spotifyClient.get(CURRENTLY_PLAYING_RESOURCE);
  switch (status) {
    case 200: {
      const { item } = await response.json<CurrentlyPlaying>();
      return item;
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
  const data = await response.json<RecentlyPlayed>();
  const item = data.items[0];
  return item ? { ...item.track, played_at: item.played_at } : null;
}
