import 'server-only';

import { Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { MusicTrack } from '@dg/db/models/MusicTrack';
import { MusicTrackArtist } from '@dg/db/models/MusicTrackArtist';
import { type SpotifyLink, spotifyUrl } from './spotifyLinks';
import { sleep } from './trackMetadataShared';
import { fetchTrackDisplayData, type TrackDisplayData } from './trackMetadataSingle';

/**
 * Display-ready track with its album and artists, each linked to its Spotify page.
 */
export type TrackDisplay = SpotifyLink & {
  album: SpotifyLink & { imageUrl: string };
  artists: Array<SpotifyLink>;
};

type CachedArtist = MusicArtist & { MusicTrackArtist: { position: number } };

const FETCH_CONCURRENCY = 5;
const FETCH_THROTTLE_MS = 100;

async function readCachedTracks(trackIds: Array<string>): Promise<Map<string, TrackDisplay>> {
  if (trackIds.length === 0) {
    return new Map();
  }

  const cachedTracks = await MusicTrack.findAll({
    include: [
      MusicAlbum,
      {
        model: MusicArtist,
        through: { attributes: ['position'] },
      },
    ],
    where: { id: { [Op.in]: trackIds } },
  });

  return new Map(
    cachedTracks.map((track) => {
      // Sequelize types the through-attributes loosely; the include above selects `position`.
      const artists = [...(track.artists as Array<CachedArtist>)].sort(
        (a, b) => a.MusicTrackArtist.position - b.MusicTrackArtist.position,
      );
      return [
        track.id,
        {
          album: {
            id: track.album.id,
            imageUrl: track.album.imageUrl,
            name: track.album.name,
            url: spotifyUrl('album', track.album.id, track.album.url),
          },
          artists: artists.map((artist) => ({
            id: artist.id,
            name: artist.name,
            url: spotifyUrl('artist', artist.id, artist.url),
          })),
          id: track.id,
          name: track.name,
          url: spotifyUrl('track', track.id, track.url),
        },
      ];
    }),
  );
}

/**
 * Fetches missing tracks from Spotify with controlled concurrency. Failures are
 * dropped so one bad track never blanks a whole page.
 */
async function fetchMissingTracks(trackIds: Array<string>): Promise<Array<TrackDisplayData>> {
  const results: Array<TrackDisplayData> = [];

  for (let i = 0; i < trackIds.length; i += FETCH_CONCURRENCY) {
    const batch = trackIds.slice(i, i + FETCH_CONCURRENCY);
    const batchResults = await Promise.allSettled(batch.map((id) => fetchTrackDisplayData(id)));

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }

    if (i + FETCH_CONCURRENCY < trackIds.length) {
      await sleep(FETCH_THROTTLE_MS);
    }
  }

  return results;
}

export async function cacheTrackData(displayData: Array<TrackDisplayData>): Promise<void> {
  if (displayData.length === 0) {
    return;
  }

  const artists = new Map<string, { id: string; name: string; url: string }>();
  const albums = new Map<string, { id: string; name: string; imageUrl: string; url: string }>();
  const tracks: Array<{ id: string; name: string; albumId: string; url: string }> = [];
  const trackArtists: Array<{ trackId: string; artistId: string; position: number }> = [];

  for (const data of displayData) {
    albums.set(data.album.id, data.album);
    tracks.push(data.track);
    for (const artist of data.artists) {
      artists.set(artist.id, { id: artist.id, name: artist.name, url: artist.url });
      trackArtists.push({
        artistId: artist.id,
        position: artist.position,
        trackId: data.track.id,
      });
    }
  }

  // Artists and albums first, then tracks, then the junction rows that reference them.
  await MusicArtist.bulkCreate([...artists.values()], { ignoreDuplicates: true });
  await MusicAlbum.bulkCreate([...albums.values()], { ignoreDuplicates: true });
  await MusicTrack.bulkCreate(tracks, { ignoreDuplicates: true });
  await MusicTrackArtist.bulkCreate(trackArtists, { ignoreDuplicates: true });
}

function toTrackDisplay(data: TrackDisplayData): TrackDisplay {
  return {
    album: {
      id: data.album.id,
      imageUrl: data.album.imageUrl,
      name: data.album.name,
      url: spotifyUrl('album', data.album.id, data.album.url),
    },
    artists: [...data.artists]
      .sort((a, b) => a.position - b.position)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        url: spotifyUrl('artist', artist.id, artist.url),
      })),
    id: data.track.id,
    name: data.track.name,
    url: spotifyUrl('track', data.track.id, data.track.url),
  };
}

/**
 * Display data for each track id: read from the Music* cache, with misses
 * fetched from Spotify and written through. Ids Spotify can't resolve are
 * absent from the result.
 */
export async function resolveTrackDisplays(
  trackIds: Array<string>,
): Promise<Map<string, TrackDisplay>> {
  const uniqueIds = [...new Set(trackIds)];
  const displays = await readCachedTracks(uniqueIds);
  const fetched = await fetchMissingTracks(uniqueIds.filter((id) => !displays.has(id)));
  await cacheTrackData(fetched);
  for (const data of fetched) {
    displays.set(data.track.id, toTrackDisplay(data));
  }
  return displays;
}
