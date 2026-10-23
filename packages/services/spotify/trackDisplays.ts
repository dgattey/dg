import 'server-only';

import { Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { MusicTrack } from '@dg/db/models/MusicTrack';
import { MusicTrackArtist } from '@dg/db/models/MusicTrackArtist';
import { sleep } from './trackMetadataShared';
import { fetchTrackDisplayData, type TrackDisplayData } from './trackMetadataSingle';

/**
 * Display-ready track with its album, flattened for rendering.
 */
export type TrackDisplay = {
  albumId: string;
  albumImageUrl: string;
  albumName: string;
  /** Spotify album page, empty when we never captured one. */
  albumUrl: string;
  artistNames: string;
  id: string;
  name: string;
  url: string;
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
          albumId: track.album.id,
          albumImageUrl: track.album.imageUrl,
          albumName: track.album.name,
          albumUrl: track.album.url ?? '',
          artistNames: artists.map((artist) => artist.name).join(', '),
          id: track.id,
          name: track.name,
          url: track.url ?? '',
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
    albumId: data.album.id,
    albumImageUrl: data.album.imageUrl,
    albumName: data.album.name,
    albumUrl: data.album.url,
    artistNames: [...data.artists]
      .sort((a, b) => a.position - b.position)
      .map((artist) => artist.name)
      .join(', '),
    id: data.track.id,
    name: data.track.name,
    url: data.track.url,
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
