import { getImageGradientFromUrl } from '../images/getImageGradient';
import type { CurrentlyPlaying } from './CurrentlyPlaying';
import type { RecentlyPlayed } from './RecentlyPlayed';
import { spotifyClient } from './spotifyClient';
import type { Track } from './Track';

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
      const data = await response.json<CurrentlyPlaying>();
      const track = data.item
        ? {
            ...data.item,
            duration_ms: data.item.duration_ms,
            is_playing: data.is_playing,
            progress_ms: data.progress_ms,
          }
        : null;
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
  const data = await response.json<RecentlyPlayed>();
  const item = data.items[0];
  const track = item ? { ...item.track, played_at: item.played_at } : null;
  return await withAlbumGradient(track);
}

const getAlbumArtUrl = (track: Track) =>
  track.album.images.find((image): image is NonNullable<typeof image> => Boolean(image))?.url ??
  null;

async function withAlbumGradient(track: Track | null): Promise<Track | null> {
  if (!track) {
    return null;
  }
  const albumArtUrl = getAlbumArtUrl(track);
  if (!albumArtUrl) {
    return track;
  }
  const gradient = await getImageGradientFromUrl(albumArtUrl);
  return gradient
    ? { ...track, albumGradient: gradient.gradient, albumGradientIsDark: gradient.isDark }
    : track;
}
