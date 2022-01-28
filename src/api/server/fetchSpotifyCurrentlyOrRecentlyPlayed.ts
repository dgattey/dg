import type { CurrentlyPlaying } from 'api/types/spotify/CurrentlyPlaying';
import type { RecentlyPlayed } from 'api/types/spotify/RecentlyPlayed';
import spotifyClient from './spotifyClient';

const CURRENTLY_PLAYING_RESOURCE = 'me/player/currently-playing';
const RECENTLY_PLAYED_RESOURCE = 'me/player/recently-played?limit=1';

/**
 * Fetches the currently playing track from spotify using a valid access token.
 * May have no content, which signifies nothing is playing, which is returned
 * as `null`, or returns full JSON.
 */
const fetchSpotifyCurrentlyPlaying = async () => {
  const currentlyPlaying = await spotifyClient.fetch<CurrentlyPlaying>(CURRENTLY_PLAYING_RESOURCE);
  switch (currentlyPlaying.status) {
    case 200:
      return { dataType: 'current', ...(await currentlyPlaying.json()) } as const;
    case 204: {
      // Fetch the last played song instead
      const recentlyPlayed = await spotifyClient.fetch<RecentlyPlayed>(RECENTLY_PLAYED_RESOURCE);
      if (recentlyPlayed.status !== 200) {
        return null;
      }
      return { dataType: 'recent', ...(await recentlyPlayed.json()) } as const;
    }
    default:
      // This could be rate limiting, or auth problems, etc.
      return null;
  }
};

export default fetchSpotifyCurrentlyPlaying;
