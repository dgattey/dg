import 'server-only';

import { db, Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { fetchAlbumDetail } from './fetchAlbumDetail';
import type {
  ListeningStats,
  StatsAlbum,
  StatsGenre,
  StatsTopTrack,
  StatsTrack,
} from './fetchListeningStats';
import type { selectTopGenres } from './listeningStatsQueries';
import { spotifyUrl, toOrderedArtistLinks } from './spotifyLinks';
import type { TrackDisplay } from './trackDisplays';
import { spotifyGet } from './trackMetadataShared';

const MAX_SPOTIFY_ARTIST_FETCHES = 8;

const artistSchema = v.looseObject({
  external_urls: v.looseObject({ spotify: v.string() }),
  genres: v.optional(v.array(v.string())),
  id: v.string(),
  name: v.string(),
});

const artistsBatchSchema = v.looseObject({
  artists: v.array(v.nullable(artistSchema)),
});

export type ResolvedArtist = {
  genres: ReadonlyArray<string>;
  name: string;
  url: string;
};

export type FavoriteAlbumSummary = {
  artistNames: string;
  id: string;
  imageUrl: string;
  name: string;
  url: string;
};

function toFetchedArtist(item: v.InferOutput<typeof artistSchema>) {
  return {
    genres: item.genres ?? [],
    id: item.id,
    name: item.name,
    url: item.external_urls.spotify,
  };
}

export async function resolveArtists(
  artistIds: Array<string>,
): Promise<Map<string, ResolvedArtist>> {
  const uniqueIds = [...new Set(artistIds)];
  if (uniqueIds.length === 0) {
    return new Map();
  }
  let cached: Array<MusicArtist> = [];
  try {
    cached = await MusicArtist.findAll({
      attributes: ['id', 'name', 'url', 'genres'],
      where: { id: { [Op.in]: uniqueIds } },
    });
  } catch (error) {
    log.warn('Could not read cached artists for listening stats', { error });
  }
  const artists = new Map<string, ResolvedArtist>(
    cached.map((artist) => [
      artist.id,
      {
        genres: artist.genres ?? [],
        name: artist.name,
        url: spotifyUrl('artist', artist.id, artist.url),
      },
    ]),
  );

  const fetched: Array<{ genres: Array<string>; id: string; name: string; url: string }> = [];
  const missingIds = uniqueIds
    .filter((artistId) => !artists.has(artistId))
    .slice(0, MAX_SPOTIFY_ARTIST_FETCHES);

  for (const id of missingIds) {
    try {
      const result = await spotifyGet(`artists/${id}`, artistSchema, 'stats artist');
      if (result.success) {
        fetched.push(toFetchedArtist(result.data));
      }
    } catch (error) {
      log.warn('Failed to fetch artist for listening stats', { error, id });
    }
  }

  if (
    process.env.NODE_ENV !== 'test' &&
    cached.length > 0 &&
    cached.every((artist) => (artist.genres ?? []).length === 0)
  ) {
    const batchIds = uniqueIds.slice(0, 50);
    try {
      const batchResult = await spotifyGet(
        `artists?ids=${batchIds.join(',')}`,
        artistsBatchSchema,
        'stats artists batch',
      );
      if (batchResult.success) {
        for (const item of batchResult.data.artists) {
          if (item) {
            fetched.push(toFetchedArtist(item));
          }
        }
      }
    } catch (error) {
      log.warn('Failed to batch-fetch artist genres for listening stats', { error });
    }
  }

  if (fetched.length > 0) {
    try {
      await MusicArtist.bulkCreate(fetched, {
        updateOnDuplicate: ['genres', 'name', 'url'],
      });
    } catch (error) {
      log.warn('Could not persist fetched artists for listening stats', { error });
    }
    for (const { genres, id, name, url } of fetched) {
      artists.set(id, { genres, name, url });
    }
  }
  return artists;
}

async function readMatchingFavoriteAlbums(
  albumIds: ReadonlyArray<string>,
): Promise<Array<FavoriteAlbumSummary>> {
  const uniqueIds = [...new Set(albumIds)];
  if (uniqueIds.length === 0) return [];
  try {
    return (await db.FavoriteAlbum.findAll({
      attributes: ['artistNames', 'id', 'imageUrl', 'name', 'url'],
      raw: true,
      where: { id: { [Op.in]: uniqueIds } },
    })) as unknown as Array<FavoriteAlbumSummary>;
  } catch (error) {
    log.warn('Could not read matching favorite albums for listening stats', { error });
    return [];
  }
}

/**
 * Albums from the catalog cache, then Spotify, then the favorite albums snapshot. The
 * snapshot keeps artist names only, so those artists link to a Spotify search.
 */
export async function resolveAlbums(
  albumIds: Array<string>,
  trackAlbumIds: ReadonlyArray<string> = [],
): Promise<{ albums: Map<string, StatsAlbum>; favoriteIds: Set<string> }> {
  const uniqueAlbumIds = [...new Set(albumIds)];
  const favoriteAlbums = await readMatchingFavoriteAlbums([...uniqueAlbumIds, ...trackAlbumIds]);
  const favoriteIds = new Set(favoriteAlbums.map((album) => album.id));
  if (uniqueAlbumIds.length === 0) {
    return { albums: new Map(), favoriteIds };
  }
  const albums = new Map<string, StatsAlbum>();
  try {
    const cached = await MusicAlbum.findAll({
      attributes: ['id', 'name', 'imageUrl', 'url'],
      include: [
        {
          attributes: ['id', 'name', 'url'],
          model: MusicArtist,
          through: { attributes: ['position'] },
        },
      ],
      where: { id: { [Op.in]: uniqueAlbumIds } },
    });
    for (const album of cached) {
      const artists = toOrderedArtistLinks(album.artists);
      if (album.name && album.imageUrl && artists.length > 0) {
        albums.set(album.id, {
          artists,
          id: album.id,
          imageUrl: album.imageUrl,
          isFavorite: favoriteIds.has(album.id),
          name: album.name,
          url: spotifyUrl('album', album.id, album.url),
        });
      }
    }
  } catch (error) {
    log.warn('Could not read cached albums for listening stats', { error });
  }

  for (const id of uniqueAlbumIds.filter((albumId) => !albums.has(albumId))) {
    try {
      const detail = await fetchAlbumDetail(id);
      if (detail) {
        albums.set(id, {
          artists: detail.artists,
          id,
          imageUrl: detail.imageUrl,
          isFavorite: favoriteIds.has(id),
          name: detail.name,
          url: detail.url,
        });
      }
    } catch (error) {
      log.warn('Failed to fetch album for listening stats', { error, id });
    }
  }

  for (const album of favoriteAlbums) {
    if (albums.has(album.id) || !uniqueAlbumIds.includes(album.id)) continue;
    albums.set(album.id, {
      artists: album.artistNames.split(', ').map((name) => ({
        id: name,
        name,
        url: `https://open.spotify.com/search/${encodeURIComponent(name)}`,
      })),
      id: album.id,
      imageUrl: album.imageUrl,
      isFavorite: true,
      name: album.name,
      url: spotifyUrl('album', album.id, album.url),
    });
  }
  return { albums, favoriteIds };
}

/** Each resolved track, with its album flagged when it is one of the favorite albums. */
export function toStatsTracks(
  displays: ReadonlyMap<string, TrackDisplay>,
  favoriteIds: ReadonlySet<string>,
): Map<string, StatsTrack> {
  return new Map(
    [...displays].map(([id, track]) => [
      id,
      { ...track, album: { ...track.album, isFavorite: favoriteIds.has(track.album.id) } },
    ]),
  );
}

export function toStatsTopTrack(
  tracks: ReadonlyMap<string, StatsTrack>,
  trackId: string,
  plays: number,
): StatsTopTrack | null {
  const track = tracks.get(trackId);
  return track ? { ...track, plays } : null;
}

export function mapCatalogSlices({
  albums,
  artistMap,
  onRepeat,
  sessions,
  shownAlbums,
  shownTracks,
  topDepthRows,
  tracks,
}: {
  albums: ReadonlyMap<string, StatsAlbum>;
  artistMap: ReadonlyMap<string, ResolvedArtist>;
  onRepeat: ReadonlyArray<{ period: string; plays: number; trackId: string }>;
  sessions: ReadonlyArray<{
    albumId: string;
    plays: number;
    sessionPlays: number;
    sessions: number;
  }>;
  shownAlbums: ReadonlyArray<{ albumId: string; plays: number }>;
  shownTracks: ReadonlyArray<{ plays: number; trackId: string }>;
  topDepthRows: ReadonlyArray<{ active: number; artistId: string; plays: number; tracks: number }>;
  tracks: ReadonlyMap<string, StatsTrack>;
}): Pick<ListeningStats, 'frontToBack' | 'onRepeat' | 'topAlbums' | 'topArtists' | 'topTracks'> {
  return {
    frontToBack: sessions
      .map(({ albumId, plays, sessionPlays, sessions: count }) => {
        const album = albums.get(albumId);
        return album ? { album, plays, sessionPlays, sessions: count } : null;
      })
      .filter(isNotNullish),
    onRepeat: onRepeat
      .map(({ period, plays, trackId }) => {
        const track = tracks.get(trackId);
        return track ? { plays, track, week: period } : null;
      })
      .filter(isNotNullish),
    topAlbums: shownAlbums
      .map(({ albumId, plays }) => {
        const album = albums.get(albumId);
        return album ? { album, plays } : null;
      })
      .filter(isNotNullish),
    topArtists: topDepthRows
      .map(({ active, artistId, plays, tracks: artistTracks }) => {
        const artist = artistMap.get(artistId);
        return artist
          ? {
              active,
              id: artistId,
              name: artist.name,
              plays,
              tracks: artistTracks,
              url: artist.url,
            }
          : null;
      })
      .filter(isNotNullish),
    topTracks: shownTracks
      .map(({ plays, trackId }) => toStatsTopTrack(tracks, trackId, plays))
      .filter(isNotNullish),
  };
}

/** Genre rows with each of their top artists linked to its Spotify page. */
export function toStatsGenres(
  rows: Awaited<ReturnType<typeof selectTopGenres>>,
): Array<StatsGenre> {
  return rows.map((row) => ({
    ...row,
    artists: row.artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      url: spotifyUrl('artist', artist.id, artist.url),
    })),
  }));
}
