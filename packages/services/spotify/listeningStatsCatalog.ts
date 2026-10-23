import 'server-only';

import { type db, Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { log } from '@dg/shared-core/logging/log';
import { isNotNullish } from '@dg/shared-core/types/typeguards';
import * as v from 'valibot';
import { fetchAlbumDetail } from './fetchAlbumDetail';
import type { StatsAlbum, StatsTopTrack, StatsYearChampion } from './fetchListeningStats';
import type { TrackDisplay } from './trackDisplays';
import { spotifyGet } from './trackMetadataShared';

const artistSchema = v.looseObject({
  external_urls: v.looseObject({ spotify: v.string() }),
  id: v.string(),
  name: v.string(),
});

export async function resolveArtists(
  artistIds: Array<string>,
): Promise<Map<string, { name: string; url: string }>> {
  const cached = await MusicArtist.findAll({ where: { id: { [Op.in]: artistIds } } });
  const artists = new Map(
    cached.map((artist) => [artist.id, { name: artist.name, url: artist.url ?? '' }]),
  );
  const fetched: Array<{ id: string; name: string; url: string }> = [];
  for (const id of artistIds.filter((artistId) => !artists.has(artistId))) {
    try {
      const result = await spotifyGet(`artists/${id}`, artistSchema, 'stats artist');
      if (result.success) {
        fetched.push({ id, name: result.data.name, url: result.data.external_urls.spotify });
      }
    } catch (error) {
      log.warn('Failed to fetch artist for listening stats', { error, id });
    }
  }
  await MusicArtist.bulkCreate(fetched, { ignoreDuplicates: true });
  for (const artist of fetched) {
    artists.set(artist.id, { name: artist.name, url: artist.url });
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

export function buildYearChampions({
  tracks,
  yearlyTopTracks,
  years,
}: {
  tracks: ReadonlyMap<string, TrackDisplay>;
  yearlyTopTracks: ReadonlyArray<{ plays: number; trackId: string; year: number }>;
  years: ReadonlyArray<{ bucket: number; plays: number }>;
}): Array<StatsYearChampion> {
  const tracksByYear = new Map(yearlyTopTracks.map((row) => [row.year, row]));
  return [...years]
    .sort((a, b) => b.bucket - a.bucket)
    .map(({ bucket: year }) => {
      const topTrackRow = tracksByYear.get(year);
      const track = topTrackRow
        ? toStatsTopTrack(tracks, topTrackRow.trackId, topTrackRow.plays)
        : null;
      return track ? { track, year } : null;
    })
    .filter(isNotNullish);
}
