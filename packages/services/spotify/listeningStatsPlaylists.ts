import 'server-only';

import { MusicPlaylist } from '@dg/db/models/MusicPlaylist';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import type { StatsPlaylist, StatsTrack } from './fetchListeningStats';
import { ALL_TIME_FILTER, type SqlPlayFilter, select, whereClause } from './listeningStatsQueries';
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
  playedTracks: number;
  playlistId: string;
  plays: number;
  topTrackId: string;
};

let memoryCachedPlaylists: { entries: Array<PlaylistCatalogEntry>; expiresAt: number } | null =
  null;
let inFlightPlaylists: Promise<Array<PlaylistCatalogEntry>> | null = null;

async function readCachedPlaylists(): Promise<Array<PlaylistCatalogEntry>> {
  try {
    const rows = await MusicPlaylist.findAll();
    return rows
      .filter((row) => row.id !== FAVORITE_ALBUMS_PLAYLIST_ID && row.trackIds.length > 0)
      .map((row) => ({
        id: row.id,
        imageUrl: row.imageUrl,
        name: row.name,
        totalTracks: Math.max(row.totalTracks, row.trackIds.length),
        trackIds: row.trackIds,
        url: spotifyUrl('playlist', row.id, row.url),
      }));
  } catch (error) {
    log.warn('Could not read cached playlists from database', { error });
    return [];
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

export async function resolvePlaylists(): Promise<Array<PlaylistCatalogEntry>> {
  const cached = await readCachedPlaylists();
  if (cached.length > 0) return cached;
  const useMemoryCache = process.env.NODE_ENV !== 'test';
  if (useMemoryCache && memoryCachedPlaylists && memoryCachedPlaylists.expiresAt > Date.now()) {
    return memoryCachedPlaylists.entries;
  }
  if (useMemoryCache && inFlightPlaylists) return await inFlightPlaylists;
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
    return await inFlightPlaylists;
  }
  return await promise;
}

export async function selectTopPlaylists(
  playlists: ReadonlyArray<PlaylistCatalogEntry>,
  filter: SqlPlayFilter = ALL_TIME_FILTER,
): Promise<Array<TopPlaylistRow>> {
  const playlistIds: Array<string> = [];
  const trackIds: Array<string> = [];
  for (const playlist of playlists) {
    for (const trackId of new Set(playlist.trackIds)) {
      playlistIds.push(playlist.id);
      trackIds.push(trackId);
    }
  }
  if (playlistIds.length === 0) return [];
  return await select(
    `WITH playlist_tracks AS (
       SELECT * FROM unnest(
         ARRAY[:playlistIds]::varchar(64)[],
         ARRAY[:trackIds]::varchar(64)[]
       ) AS pt("playlistId", "trackId")
     ),
     matched AS (
       SELECT pt."playlistId", p."trackId", count(*)::int AS plays
       FROM playlist_tracks pt
       JOIN "SpotifyPlay" p ON p."trackId" = pt."trackId"
       ${whereClause(filter, 'p')}
       GROUP BY pt."playlistId", p."trackId"
     )
     SELECT "playlistId",
       sum(plays)::int AS plays,
       count(*)::int AS "playedTracks",
       (array_agg("trackId" ORDER BY plays DESC, "trackId"))[1] AS "topTrackId"
     FROM matched
     GROUP BY "playlistId"
     ORDER BY plays DESC, "playlistId"
     LIMIT ${TOP_PLAYLISTS_LIMIT}`,
    v.object({
      playedTracks: v.number(),
      playlistId: v.string(),
      plays: v.number(),
      topTrackId: v.string(),
    }),
    { playlistIds, trackIds },
  );
}

export async function fetchTopPlaylistRows(filter: SqlPlayFilter = ALL_TIME_FILTER) {
  const catalog = await resolvePlaylists();
  const rows = await selectTopPlaylists(catalog, filter);
  return { catalog, rows };
}

export function toStatsPlaylists(
  rows: ReadonlyArray<TopPlaylistRow>,
  catalog: ReadonlyArray<PlaylistCatalogEntry>,
  tracks: ReadonlyMap<string, StatsTrack>,
): Array<StatsPlaylist> {
  const byId = new Map(catalog.map((playlist) => [playlist.id, playlist]));
  return rows
    .map((row) => {
      const playlist = byId.get(row.playlistId);
      if (!playlist) return null;
      const topTrack = tracks.get(row.topTrackId);
      const imageUrl = playlist.imageUrl || topTrack?.album.imageUrl || '';
      if (!imageUrl) return null;
      return {
        id: playlist.id,
        imageUrl,
        name: playlist.name,
        playedTracks: row.playedTracks,
        plays: row.plays,
        ...(topTrack ? { topTrack } : {}),
        totalTracks: Math.max(playlist.totalTracks, row.playedTracks),
        url: playlist.url,
      };
    })
    .filter(isNotNullish);
}
