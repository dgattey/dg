import 'server-only';

import { db, Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { MusicTrack } from '@dg/db/models/MusicTrack';
import { MusicTrackArtist } from '@dg/db/models/MusicTrackArtist';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { sleep } from './trackMetadataShared';
import { fetchTrackDisplayData, type TrackDisplayData } from './trackMetadataSingle';

/**
 * Lightweight history track for UI rendering.
 * Uses valibot for schema definition and runtime validation.
 */
export const historyTrackSchema = v.object({
  albumImageUrl: v.string(),
  albumName: v.string(),
  artistNames: v.string(),
  playedAt: v.string(),
  trackId: v.string(),
  trackName: v.string(),
  url: v.string(),
});

export type HistoryTrack = v.InferOutput<typeof historyTrackSchema>;

type MusicHistoryPage = {
  tracks: Array<HistoryTrack>;
  nextCursor: string | null;
};

type MusicHistoryPageOptions = {
  before?: Date;
  pageSize?: number;
};

type SpotifyHistoryRow = {
  playedAt: Date;
  trackId: string;
};

const DEFAULT_PAGE_SIZE = 24;
const FETCH_CONCURRENCY = 5;
const FETCH_THROTTLE_MS = 100;

/**
 * Fetches SpotifyPlay rows from the database.
 */
function fetchSpotifyPlayRows({
  before,
  pageSize = DEFAULT_PAGE_SIZE,
}: MusicHistoryPageOptions): Promise<Array<SpotifyHistoryRow>> {
  const whereClause = before ? { playedAt: { [Op.lt]: before } } : {};
  return db.SpotifyPlay.findAll({
    attributes: ['playedAt', 'trackId'],
    limit: pageSize + 1,
    order: [['playedAt', 'DESC']],
    where: whereClause,
  });
}

/**
 * Looks up cached track data from the Music* tables.
 * Returns a map of trackId -> cached data.
 */
async function getCachedTracks(trackIds: Array<string>): Promise<
  Map<
    string,
    {
      track: MusicTrack;
      album: MusicAlbum;
      artists: Array<MusicArtist & { MusicTrackArtist: { position: number } }>;
    }
  >
> {
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
    cachedTracks.map((track) => [
      track.id,
      {
        album: track.album,
        artists: track.artists as Array<MusicArtist & { MusicTrackArtist: { position: number } }>,
        track,
      },
    ]),
  );
}

/**
 * Fetches missing tracks from Spotify API with controlled concurrency.
 * Uses Promise.allSettled for resilience.
 */
async function fetchMissingTracks(trackIds: Array<string>): Promise<Array<TrackDisplayData>> {
  const results: Array<TrackDisplayData> = [];

  // Process in batches to control concurrency
  for (let i = 0; i < trackIds.length; i += FETCH_CONCURRENCY) {
    const batch = trackIds.slice(i, i + FETCH_CONCURRENCY);
    const batchResults = await Promise.allSettled(batch.map((id) => fetchTrackDisplayData(id)));

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value);
      }
    }

    // Throttle between batches
    if (i + FETCH_CONCURRENCY < trackIds.length) {
      await sleep(FETCH_THROTTLE_MS);
    }
  }

  return results;
}

/**
 * Writes newly fetched track data to the Music* cache tables.
 */
async function cacheTrackData(displayData: Array<TrackDisplayData>): Promise<void> {
  if (displayData.length === 0) {
    return;
  }

  // Collect unique entities
  const artists = new Map<string, { id: string; name: string; url: string }>();
  const albums = new Map<string, { id: string; name: string; imageUrl: string; url: string }>();
  const tracks: Array<{ id: string; name: string; albumId: string; url: string }> = [];
  const trackArtists: Array<{ trackId: string; artistId: string; position: number }> = [];

  for (const data of displayData) {
    // Collect album
    albums.set(data.album.id, data.album);

    // Collect track
    tracks.push(data.track);

    // Collect artists and track-artist relationships
    for (const artist of data.artists) {
      artists.set(artist.id, { id: artist.id, name: artist.name, url: artist.url });
      trackArtists.push({
        artistId: artist.id,
        position: artist.position,
        trackId: data.track.id,
      });
    }
  }

  // Insert in correct order (artists/albums first, then tracks, then junction)
  await MusicArtist.bulkCreate([...artists.values()], { ignoreDuplicates: true });
  await MusicAlbum.bulkCreate([...albums.values()], { ignoreDuplicates: true });
  await MusicTrack.bulkCreate(tracks, { ignoreDuplicates: true });
  await MusicTrackArtist.bulkCreate(trackArtists, { ignoreDuplicates: true });
}

/**
 * Converts cached track data to a HistoryTrack.
 */
function toHistoryTrack(
  cached: {
    track: MusicTrack;
    album: MusicAlbum;
    artists: Array<MusicArtist & { MusicTrackArtist: { position: number } }>;
  },
  playedAt: Date,
): HistoryTrack {
  // Sort artists by position and join names
  const sortedArtists = [...cached.artists].sort(
    (a, b) => a.MusicTrackArtist.position - b.MusicTrackArtist.position,
  );
  const artistNames = sortedArtists.map((a) => a.name).join(', ');

  return v.parse(historyTrackSchema, {
    albumImageUrl: cached.album.imageUrl,
    albumName: cached.album.name,
    artistNames,
    playedAt: playedAt.toISOString(),
    trackId: cached.track.id,
    trackName: cached.track.name,
    url: cached.track.url ?? '',
  });
}

/**
 * Converts freshly fetched display data to a HistoryTrack.
 */
function displayDataToHistoryTrack(data: TrackDisplayData, playedAt: Date): HistoryTrack {
  const artistNames = data.artists
    .sort((a, b) => a.position - b.position)
    .map((a) => a.name)
    .join(', ');

  return v.parse(historyTrackSchema, {
    albumImageUrl: data.album.imageUrl,
    albumName: data.album.name,
    artistNames,
    playedAt: playedAt.toISOString(),
    trackId: data.track.id,
    trackName: data.track.name,
    url: data.track.url,
  });
}

/**
 * Fetches a page of music history with efficient caching.
 *
 * 1. Queries SpotifyPlay rows from the database
 * 2. Looks up cached track data from Music* tables
 * 3. Fetches missing tracks from Spotify API
 * 4. Caches newly fetched data
 * 5. Returns lightweight HistoryTrack objects
 */
export async function fetchMusicHistoryPage({
  before,
  pageSize = DEFAULT_PAGE_SIZE,
}: MusicHistoryPageOptions): Promise<MusicHistoryPage> {
  // Step 1: Get play history rows
  const plays = await fetchSpotifyPlayRows({ before, pageSize });

  const hasMore = plays.length > pageSize;
  const pageItems = plays.slice(0, pageSize);
  const lastPlayedAt = pageItems[pageItems.length - 1]?.playedAt;
  const nextCursor = hasMore && lastPlayedAt ? lastPlayedAt.toISOString() : null;

  if (pageItems.length === 0) {
    return { nextCursor: null, tracks: [] };
  }

  // Step 2: Deduplicate and look up cached tracks
  const uniqueTrackIds = [...new Set(pageItems.map((p) => p.trackId))];
  const cachedTracks = await getCachedTracks(uniqueTrackIds);

  // Step 3: Identify uncached tracks and fetch from API
  const uncachedIds = uniqueTrackIds.filter((id) => !cachedTracks.has(id));
  const fetchedData = await fetchMissingTracks(uncachedIds);

  // Step 4: Cache newly fetched data
  await cacheTrackData(fetchedData);

  // Create a map of fetched data for quick lookup
  const fetchedMap = new Map(fetchedData.map((d) => [d.track.id, d]));

  // Step 5: Map to HistoryTrack objects, preserving play order
  const tracks = pageItems
    .map((play) => {
      const cached = cachedTracks.get(play.trackId);
      if (cached) {
        return toHistoryTrack(cached, play.playedAt);
      }

      const fetched = fetchedMap.get(play.trackId);
      if (fetched) {
        return displayDataToHistoryTrack(fetched, play.playedAt);
      }

      return null;
    })
    .filter(isNotNullish);

  return { nextCursor, tracks };
}
