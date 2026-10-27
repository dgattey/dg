import 'server-only';

import { MusicPlaylist } from '@dg/db/models/MusicPlaylist';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import type { StatsPlaylist, StatsTrack } from './fetchListeningStats';
import { ALL_TIME_FILTER, type SqlPlayFilter, whereClause } from './listeningStatsFilters';
import { select } from './listeningStatsQueries';
import { FAVORITE_ALBUMS_PLAYLIST_ID } from './refreshFavoriteAlbumsSnapshot';
import { spotifyUrl } from './spotifyLinks';
import { bestSpotifyImage, mapInBatches, spotifyGet } from './trackMetadataShared';

const PLAYLIST_PAGE_SIZE = 50;
const MAX_PLAYLIST_LIST_PAGES = 2;
const TRACK_PAGE_SIZE = 100;
const MAX_TRACK_PAGES_PER_PLAYLIST = 2;
const FETCH_CONCURRENCY = 8;
const FETCH_THROTTLE_MS = 25;
const TOP_PLAYLISTS_LIMIT = 6;
const MEMORY_CACHE_TTL_MS = 60 * 60 * 1000;

const playlistImageSchema = v.looseObject({
  height: v.optional(v.nullable(v.number())),
  url: v.string(),
  width: v.optional(v.nullable(v.number())),
});

const simplifiedPlaylistSchema = v.looseObject({
  external_urls: v.optional(v.nullable(v.looseObject({ spotify: v.optional(v.string()) }))),
  id: v.string(),
  images: v.optional(v.nullable(v.array(playlistImageSchema))),
  name: v.string(),
  owner: v.optional(v.nullable(v.looseObject({ id: v.optional(v.string()) }))),
  tracks: v.optional(v.nullable(v.looseObject({ total: v.optional(v.number()) }))),
});

const userPlaylistsPageSchema = v.looseObject({
  items: v.array(v.nullable(simplifiedPlaylistSchema)),
  next: v.optional(v.nullable(v.string())),
});

const playlistTracksPageSchema = v.looseObject({
  items: v.array(
    v.nullable(
      v.looseObject({
        track: v.optional(v.nullable(v.looseObject({ id: v.optional(v.nullable(v.string())) }))),
      }),
    ),
  ),
  next: v.optional(v.nullable(v.string())),
});

export type PlaylistCatalogEntry = {
  id: string;
  imageUrl: string;
  name: string;
  totalTracks: number;
  trackIds: Array<string>;
  url: string;
};

export type TopPlaylistRow = {
  imageUrl: string;
  name: string;
  playedTracks: number;
  playlistId: string;
  plays: number;
  topTrackId: string;
  totalTracks: number;
  url: string | null;
};

let memoryCachedPlaylists: { entries: Array<PlaylistCatalogEntry>; expiresAt: number } | null =
  null;
let inFlightPlaylists: Promise<Array<PlaylistCatalogEntry>> | null = null;

async function hasCachedPlaylistsInDb(): Promise<boolean> {
  try {
    const [row] = await select(
      `SELECT EXISTS (
         SELECT 1 FROM "MusicPlaylist"
         WHERE id <> :favoriteAlbumsPlaylistId
           AND coalesce(array_length("trackIds", 1), 0) > 0
       ) AS "hasPlaylists"`,
      v.object({ hasPlaylists: v.boolean() }),
      { favoriteAlbumsPlaylistId: FAVORITE_ALBUMS_PLAYLIST_ID },
    );
    return row?.hasPlaylists ?? false;
  } catch (error) {
    log.warn('Could not check cached playlists in database', { error });
    return false;
  }
}

async function fetchEmbedPlaylistTrackIds(playlistId: string): Promise<Array<string>> {
  if (process.env.NODE_ENV === 'test') return [];
  try {
    const res = await fetch(`https://open.spotify.com/embed/playlist/${playlistId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const html = await res.text();
    const nextDataJson = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(html)?.[1];
    if (!nextDataJson) return [];
    const trackIds = new Set<string>();
    for (const match of nextDataJson.matchAll(/spotify:track:([0-9A-Za-z]{22})/g)) {
      if (match[1]) trackIds.add(match[1]);
    }
    return [...trackIds];
  } catch {
    return [];
  }
}

async function fetchPlaylistTrackIds(
  playlistId: string,
  state: { rateLimited: boolean },
): Promise<Array<string>> {
  const trackIds = new Set<string>();
  let hasMore = true;
  for (let page = 0; hasMore && page < MAX_TRACK_PAGES_PER_PLAYLIST && !state.rateLimited; page++) {
    const resource = `playlists/${playlistId}/tracks?fields=items(track(id)),next&limit=${TRACK_PAGE_SIZE}&offset=${page * TRACK_PAGE_SIZE}`;
    const result = await spotifyGet(resource, playlistTracksPageSchema, 'stats playlist tracks');
    if (!result.success) {
      if ([401, 403, 404, 429].includes(result.status)) state.rateLimited = true;
      break;
    }
    for (const item of result.data.items) {
      const id = item?.track?.id?.trim();
      if (id) trackIds.add(id);
    }
    hasMore = Boolean(result.data.next);
  }
  return trackIds.size > 0 ? [...trackIds] : await fetchEmbedPlaylistTrackIds(playlistId);
}

async function fetchPlaylistsFromSpotify(): Promise<Array<PlaylistCatalogEntry>> {
  const summaries: Array<v.InferOutput<typeof simplifiedPlaylistSchema>> = [];
  const seenIds = new Set<string>();
  const state = { rateLimited: false };

  try {
    let hasMore = true;
    for (let page = 0; hasMore && page < MAX_PLAYLIST_LIST_PAGES; page += 1) {
      const resource = `me/playlists?limit=${PLAYLIST_PAGE_SIZE}&offset=${page * PLAYLIST_PAGE_SIZE}`;
      const result = await spotifyGet(resource, userPlaylistsPageSchema, 'stats playlists');
      if (!result.success) {
        if (result.status === 429) state.rateLimited = true;
        break;
      }
      for (const item of result.data.items) {
        if (
          !item ||
          seenIds.has(item.id) ||
          item.id === FAVORITE_ALBUMS_PLAYLIST_ID ||
          item.owner?.id === 'spotify' ||
          (item.tracks?.total ?? 0) <= 0
        ) {
          continue;
        }
        seenIds.add(item.id);
        summaries.push(item);
      }
      hasMore = Boolean(result.data.next);
    }
  } catch (error) {
    log.warn('Failed to fetch user playlists for listening stats', { error });
    return [];
  }

  const fetched = await mapInBatches(
    summaries,
    async (item) => {
      const trackIds = await fetchPlaylistTrackIds(item.id, state);
      if (trackIds.length === 0) return null;
      return {
        id: item.id,
        imageUrl: bestSpotifyImage(item.images ?? []),
        name: item.name,
        totalTracks: Math.max(item.tracks?.total ?? 0, trackIds.length),
        trackIds,
        url: spotifyUrl('playlist', item.id, item.external_urls?.spotify),
      };
    },
    { concurrency: FETCH_CONCURRENCY, throttleMs: FETCH_THROTTLE_MS },
  );

  if (fetched.length > 0) {
    try {
      await MusicPlaylist.bulkCreate(fetched, {
        updateOnDuplicate: ['imageUrl', 'name', 'totalTracks', 'trackIds', 'url'],
      });
    } catch (error) {
      log.warn('Could not persist fetched playlists to database', { error });
    }
  }

  return fetched;
}

async function seedPlaylistsIfNeeded(): Promise<void> {
  const useMemoryCache = process.env.NODE_ENV !== 'test';
  if (useMemoryCache && memoryCachedPlaylists && memoryCachedPlaylists.expiresAt > Date.now()) {
    return;
  }
  if (useMemoryCache && inFlightPlaylists) {
    await inFlightPlaylists;
    return;
  }
  const promise = fetchPlaylistsFromSpotify().then((entries) => {
    if (useMemoryCache && entries.length > 0) {
      memoryCachedPlaylists = { entries, expiresAt: Date.now() + MEMORY_CACHE_TTL_MS };
    }
    return entries;
  });
  if (useMemoryCache) {
    inFlightPlaylists = promise.finally(() => {
      inFlightPlaylists = null;
    });
    await inFlightPlaylists;
    return;
  }
  await promise;
}

/**
 * Joins `"MusicPlaylist"` against `"SpotifyPlay"` directly inside Postgres so the
 * multi-thousand-element `trackIds` arrays stay in Postgres memory and only the top 6
 * playlist summary rows cross the network.
 */
async function selectTopPlaylistsFromDb(
  filter: SqlPlayFilter = ALL_TIME_FILTER,
): Promise<Array<TopPlaylistRow>> {
  return await select(
    `WITH playlist_tracks AS (
       SELECT DISTINCT mp.id AS "playlistId", track_id AS "trackId"
       FROM "MusicPlaylist" mp,
       LATERAL unnest(mp."trackIds") AS track_id
       WHERE mp.id <> :favoriteAlbumsPlaylistId
         AND coalesce(array_length(mp."trackIds", 1), 0) > 0
     ),
     matched AS (
       SELECT pt."playlistId", p."trackId", count(*)::int AS plays
       FROM playlist_tracks pt
       JOIN "SpotifyPlay" p ON p."trackId" = pt."trackId"
       ${whereClause(filter, 'p')}
       GROUP BY pt."playlistId", p."trackId"
     ),
     ranked AS (
       SELECT "playlistId",
         sum(plays)::int AS plays,
         count(*)::int AS "playedTracks",
         (array_agg("trackId" ORDER BY plays DESC, "trackId"))[1] AS "topTrackId"
       FROM matched
       GROUP BY "playlistId"
       ORDER BY plays DESC, "playlistId"
       LIMIT ${TOP_PLAYLISTS_LIMIT}
     )
     SELECT
       mp.id AS "playlistId",
       mp.name,
       mp."imageUrl",
       mp.url,
       GREATEST(mp."totalTracks", coalesce(array_length(mp."trackIds", 1), 0))::int AS "totalTracks",
       r.plays,
       r."playedTracks",
       r."topTrackId"
     FROM ranked r
     JOIN "MusicPlaylist" mp ON mp.id = r."playlistId"
     ORDER BY r.plays DESC, mp.id`,
    v.object({
      imageUrl: v.string(),
      name: v.string(),
      playedTracks: v.number(),
      playlistId: v.string(),
      plays: v.number(),
      topTrackId: v.string(),
      totalTracks: v.number(),
      url: v.nullable(v.string()),
    }),
    { favoriteAlbumsPlaylistId: FAVORITE_ALBUMS_PLAYLIST_ID },
  );
}

export async function fetchTopPlaylistRows(
  filter: SqlPlayFilter = ALL_TIME_FILTER,
): Promise<Array<TopPlaylistRow>> {
  try {
    const initialRows = await selectTopPlaylistsFromDb(filter);
    if (initialRows.length > 0) {
      return initialRows;
    }
    if (await hasCachedPlaylistsInDb()) {
      return [];
    }
    await seedPlaylistsIfNeeded();
    return await selectTopPlaylistsFromDb(filter);
  } catch (error) {
    log.warn('Could not query top playlists from database', { error });
    return [];
  }
}

export function toStatsPlaylists(
  rows: ReadonlyArray<TopPlaylistRow>,
  tracks: ReadonlyMap<string, StatsTrack>,
): Array<StatsPlaylist> {
  return rows
    .map((row) => {
      const topTrack = tracks.get(row.topTrackId);
      const imageUrl = row.imageUrl || topTrack?.album.imageUrl || '';
      if (!imageUrl) return null;
      return {
        id: row.playlistId,
        imageUrl,
        name: row.name,
        playedTracks: row.playedTracks,
        plays: row.plays,
        ...(topTrack ? { topTrack } : {}),
        totalTracks: Math.max(row.totalTracks, row.playedTracks),
        url: spotifyUrl('playlist', row.playlistId, row.url),
      };
    })
    .filter(isNotNullish);
}
