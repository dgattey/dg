import 'server-only';

import { type db, Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { fetchAlbumDetail } from './fetchAlbumDetail';
import type {
  ListeningStats,
  StatsAlbum,
  StatsTopArtist,
  StatsTopTrack,
} from './fetchListeningStats';
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

export async function resolveArtists(
  artistIds: Array<string>,
): Promise<Map<string, ResolvedArtist>> {
  const uniqueIds = [...new Set(artistIds)];
  if (uniqueIds.length === 0) {
    return new Map();
  }
  const cached = await MusicArtist.findAll({ where: { id: { [Op.in]: uniqueIds } } });
  const artists = new Map<string, ResolvedArtist>(
    cached.map((artist) => [
      artist.id,
      { genres: artist.genres ?? [], name: artist.name, url: artist.url ?? '' },
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
        fetched.push({
          genres: result.data.genres ?? [],
          id,
          name: result.data.name,
          url: result.data.external_urls.spotify,
        });
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
            fetched.push({
              genres: item.genres ?? [],
              id: item.id,
              name: item.name,
              url: item.external_urls.spotify,
            });
          }
        }
      }
    } catch (error) {
      log.warn('Failed to batch-fetch artist genres for listening stats', { error });
    }
  }

  if (fetched.length > 0) {
    await MusicArtist.bulkCreate(fetched, {
      updateOnDuplicate: ['genres', 'name', 'url'],
    });
    for (const artist of fetched) {
      artists.set(artist.id, {
        genres: artist.genres,
        name: artist.name,
        url: artist.url,
      });
    }
  }
  return artists;
}

type CachedAlbumArtist = MusicArtist & { MusicAlbumArtist: { position: number } };

export async function resolveAlbums(
  albumIds: Array<string>,
  favoriteAlbums: ReadonlyArray<InstanceType<typeof db.FavoriteAlbum>>,
): Promise<Map<string, StatsAlbum>> {
  const albums = new Map<string, StatsAlbum>();
  const cached = await MusicAlbum.findAll({
    include: [{ model: MusicArtist, through: { attributes: ['position'] } }],
    where: { id: { [Op.in]: albumIds } },
  });
  for (const album of cached) {
    const artists = [...(album.artists as Array<CachedAlbumArtist>)].sort(
      (a, b) => a.MusicAlbumArtist.position - b.MusicAlbumArtist.position,
    );
    if (album.name && album.imageUrl && artists.length > 0) {
      albums.set(album.id, {
        artistNames: artists.map((artist) => artist.name).join(', '),
        id: album.id,
        imageUrl: album.imageUrl,
        name: album.name,
        url: album.url ?? '',
      });
    }
  }

  const shelvedById = new Map(favoriteAlbums.map((album) => [album.id, album]));
  for (const id of albumIds) {
    if (albums.has(id)) continue;
    const album = shelvedById.get(id);
    if (album) {
      albums.set(album.id, {
        artistNames: album.artistNames,
        id: album.id,
        imageUrl: album.imageUrl,
        name: album.name,
        url: album.url,
      });
    }
  }

  for (const id of albumIds.filter((albumId) => !albums.has(albumId))) {
    try {
      const detail = await fetchAlbumDetail(id);
      if (detail) {
        albums.set(id, {
          artistNames: detail.artists.map((artist) => artist.name).join(', '),
          id,
          imageUrl: detail.imageUrl,
          name: detail.name,
          url: detail.url,
        });
      }
    } catch (error) {
      log.warn('Failed to fetch album for listening stats', { error, id });
    }
  }
  return albums;
}

export function toStatsTopTrack(
  tracks: ReadonlyMap<string, TrackDisplay>,
  trackId: string,
  plays: number,
): StatsTopTrack | null {
  const track = tracks.get(trackId);
  return track
    ? {
        albumImageUrl: track.albumImageUrl,
        albumName: track.albumName,
        artistNames: track.artistNames,
        id: track.id,
        name: track.name,
        plays,
        url: track.url,
      }
    : null;
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
  topDepthRows: ReadonlyArray<{ artistId: string; months: number; plays: number; tracks: number }>;
  tracks: ReadonlyMap<string, TrackDisplay>;
}): Pick<
  ListeningStats,
  'depth' | 'frontToBack' | 'onRepeat' | 'topAlbums' | 'topArtists' | 'topTracks'
> {
  const topArtists: Array<StatsTopArtist> = topDepthRows
    .map(({ artistId, months, plays, tracks: artistTracks }) => {
      const artist = artistMap.get(artistId);
      return artist
        ? { id: artistId, months, name: artist.name, plays, tracks: artistTracks, url: artist.url }
        : null;
    })
    .filter(isNotNullish);

  return {
    depth: topArtists.map(({ months, name, plays, tracks: artistTracks }) => ({
      months,
      name,
      plays,
      tracks: artistTracks,
    })),
    frontToBack: sessions
      .map(({ albumId, plays, sessionPlays, sessions: count }) => {
        const album = albums.get(albumId);
        return album ? { album, plays, sessionPlays, sessions: count } : null;
      })
      .filter(isNotNullish),
    onRepeat: onRepeat
      .map(({ period, plays, trackId }) => {
        const track = tracks.get(trackId);
        return track
          ? {
              plays,
              track: {
                artistNames: track.artistNames,
                id: track.id,
                name: track.name,
                url: track.url,
              },
              week: period,
            }
          : null;
      })
      .filter(isNotNullish),
    topAlbums: shownAlbums
      .map(({ albumId, plays }) => {
        const album = albums.get(albumId);
        return album ? { album, plays } : null;
      })
      .filter(isNotNullish),
    topArtists,
    topTracks: shownTracks
      .map(({ plays, trackId }) => toStatsTopTrack(tracks, trackId, plays))
      .filter(isNotNullish),
  };
}
