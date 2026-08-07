import 'server-only';

import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicAlbumArtist } from '@dg/db/models/MusicAlbumArtist';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { MusicTrack } from '@dg/db/models/MusicTrack';
import { MusicTrackArtist } from '@dg/db/models/MusicTrackArtist';
import * as v from 'valibot';
import type { AlbumDetail, AlbumDetailArtist, AlbumDetailTrack } from './albumDetailTypes';
import { spotifyGet } from './trackMetadataShared';

export type { AlbumDetail, AlbumDetailArtist, AlbumDetailTrack } from './albumDetailTypes';

const albumArtistSchema = v.looseObject({
  external_urls: v.looseObject({ spotify: v.string() }),
  id: v.string(),
  name: v.string(),
});

const albumTrackSchema = v.looseObject({
  artists: v.array(albumArtistSchema),
  disc_number: v.optional(v.number()),
  duration_ms: v.optional(v.number()),
  external_urls: v.looseObject({ spotify: v.string() }),
  id: v.string(),
  name: v.string(),
  track_number: v.optional(v.number()),
});

const albumDetailSchema = v.looseObject({
  artists: v.array(albumArtistSchema),
  external_urls: v.looseObject({ spotify: v.string() }),
  id: v.string(),
  images: v.array(
    v.looseObject({
      height: v.number(),
      url: v.string(),
      width: v.number(),
    }),
  ),
  label: v.optional(v.nullable(v.string())),
  name: v.string(),
  popularity: v.optional(v.nullable(v.number())),
  release_date: v.optional(v.nullable(v.string())),
  total_tracks: v.optional(v.nullable(v.number())),
  tracks: v.optional(
    v.looseObject({
      items: v.array(albumTrackSchema),
      next: v.optional(v.nullable(v.string())),
      total: v.optional(v.number()),
    }),
  ),
});

const albumTracksPageSchema = v.looseObject({
  items: v.array(albumTrackSchema),
  next: v.optional(v.nullable(v.string())),
});

type ArtistRow = { id: string; name: string; url: string; position: number };

function bestImage(images: Array<{ height: number; url: string; width: number }>): string {
  const preferred = images.find((img) => img.width === 640) ?? images[0];
  return preferred?.url ?? '';
}

function mapArtist(artist: v.InferOutput<typeof albumArtistSchema>, position: number): ArtistRow {
  return {
    id: artist.id,
    name: artist.name,
    position,
    url: artist.external_urls.spotify,
  };
}

function sortTracks(tracks: Array<AlbumDetailTrack>): Array<AlbumDetailTrack> {
  return [...tracks].sort(
    (a, b) =>
      a.discNumber - b.discNumber || a.trackNumber - b.trackNumber || a.name.localeCompare(b.name),
  );
}

function isCompleteAlbumCache(album: MusicAlbum, tracks: Array<MusicTrack>): boolean {
  if (album.totalTracks == null || album.totalTracks < 1) {
    return false;
  }
  if (tracks.length < album.totalTracks) {
    return false;
  }
  return tracks.every((track) => track.trackNumber != null);
}

async function readAlbumFromDb(albumId: string): Promise<AlbumDetail | null> {
  const album = await MusicAlbum.findByPk(albumId, {
    include: [
      {
        model: MusicArtist,
        through: { attributes: ['position'] },
      },
    ],
  });
  if (!album) {
    return null;
  }

  const tracks = await MusicTrack.findAll({
    include: [
      {
        model: MusicArtist,
        through: { attributes: ['position'] },
      },
    ],
    where: { albumId },
  });

  if (!isCompleteAlbumCache(album, tracks)) {
    return null;
  }

  const albumArtists = [...(album.artists ?? [])].sort((a, b) => {
    const aPos = (a as MusicArtist & { MusicAlbumArtist?: { position: number } }).MusicAlbumArtist
      ?.position;
    const bPos = (b as MusicArtist & { MusicAlbumArtist?: { position: number } }).MusicAlbumArtist
      ?.position;
    return (aPos ?? 0) - (bPos ?? 0);
  });

  const mappedTracks = sortTracks(
    tracks.map((track) => {
      const artists = [...(track.artists ?? [])].sort((a, b) => {
        const aPos = (a as MusicArtist & { MusicTrackArtist?: { position: number } })
          .MusicTrackArtist?.position;
        const bPos = (b as MusicArtist & { MusicTrackArtist?: { position: number } })
          .MusicTrackArtist?.position;
        return (aPos ?? 0) - (bPos ?? 0);
      });
      return {
        artists: artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          url: artist.url ?? `https://open.spotify.com/artist/${artist.id}`,
        })),
        discNumber: track.discNumber ?? 1,
        durationMs: track.durationMs,
        id: track.id,
        name: track.name,
        trackNumber: track.trackNumber ?? 0,
        url: track.url ?? `https://open.spotify.com/track/${track.id}`,
      };
    }),
  );

  const artists: Array<AlbumDetailArtist> =
    albumArtists.length > 0
      ? albumArtists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          url: artist.url ?? `https://open.spotify.com/artist/${artist.id}`,
        }))
      : (mappedTracks[0]?.artists ?? []);

  const durationMs = mappedTracks.reduce((sum, track) => sum + (track.durationMs ?? 0), 0);

  return {
    artists,
    durationMs,
    id: album.id,
    imageUrl: album.imageUrl,
    label: album.label,
    name: album.name,
    popularity: album.popularity,
    releaseDate: album.releaseDate,
    totalTracks: album.totalTracks ?? mappedTracks.length,
    tracks: mappedTracks,
    url: album.url ?? `https://open.spotify.com/album/${album.id}`,
  };
}

async function fetchAllAlbumTracks(
  albumId: string,
  firstPage: v.InferOutput<typeof albumDetailSchema>['tracks'],
): Promise<Array<v.InferOutput<typeof albumTrackSchema>>> {
  const items = [...(firstPage?.items ?? [])];
  let next = firstPage?.next ?? null;
  let offset = items.length;

  while (next) {
    const page = await spotifyGet(
      `albums/${albumId}/tracks?limit=50&offset=${offset}`,
      albumTracksPageSchema,
      'album tracks page',
    );
    if (!page.success) {
      break;
    }
    items.push(...page.data.items);
    next = page.data.next ?? null;
    offset = items.length;
  }

  return items;
}

async function fetchAlbumFromSpotify(albumId: string): Promise<AlbumDetail | null> {
  const result = await spotifyGet(`albums/${albumId}`, albumDetailSchema, 'album detail');
  if (!result.success) {
    if (result.status === 404) {
      return null;
    }
    throw new Error(`Spotify album ${albumId} fetch failed: ${result.error}`);
  }

  const album = result.data;
  const trackItems = await fetchAllAlbumTracks(albumId, album.tracks);
  const artists: Array<AlbumDetailArtist> = album.artists.map((artist, position) => {
    const mapped = mapArtist(artist, position);
    return { id: mapped.id, name: mapped.name, url: mapped.url };
  });
  const tracks = sortTracks(
    trackItems.map((track, index) => ({
      artists: track.artists.map((artist, position) => {
        const mapped = mapArtist(artist, position);
        return { id: mapped.id, name: mapped.name, url: mapped.url };
      }),
      discNumber: track.disc_number ?? 1,
      durationMs: track.duration_ms ?? null,
      id: track.id,
      name: track.name,
      trackNumber: track.track_number ?? index + 1,
      url: track.external_urls.spotify,
    })),
  );

  return {
    artists,
    durationMs: tracks.reduce((sum, track) => sum + (track.durationMs ?? 0), 0),
    id: album.id,
    imageUrl: bestImage(album.images),
    label: album.label ?? null,
    name: album.name,
    popularity: album.popularity ?? null,
    releaseDate: album.release_date ?? null,
    totalTracks: album.total_tracks ?? tracks.length,
    tracks,
    url: album.external_urls.spotify,
  };
}

async function writeAlbumThrough(detail: AlbumDetail): Promise<void> {
  const artists = new Map<string, { id: string; name: string; url: string }>();
  const albumArtists: Array<{ albumId: string; artistId: string; position: number }> = [];
  const tracks: Array<{
    id: string;
    name: string;
    albumId: string;
    url: string;
    durationMs: number | null;
    trackNumber: number;
    discNumber: number;
  }> = [];
  const trackArtists: Array<{ trackId: string; artistId: string; position: number }> = [];

  for (const [position, artist] of detail.artists.entries()) {
    artists.set(artist.id, artist);
    albumArtists.push({ albumId: detail.id, artistId: artist.id, position });
  }

  for (const track of detail.tracks) {
    tracks.push({
      albumId: detail.id,
      discNumber: track.discNumber,
      durationMs: track.durationMs,
      id: track.id,
      name: track.name,
      trackNumber: track.trackNumber,
      url: track.url,
    });
    for (const [position, artist] of track.artists.entries()) {
      artists.set(artist.id, artist);
      trackArtists.push({ artistId: artist.id, position, trackId: track.id });
    }
  }

  await MusicArtist.bulkCreate([...artists.values()], { ignoreDuplicates: true });
  await MusicAlbum.upsert({
    id: detail.id,
    imageUrl: detail.imageUrl,
    label: detail.label,
    name: detail.name,
    popularity: detail.popularity,
    releaseDate: detail.releaseDate,
    totalTracks: detail.totalTracks,
    url: detail.url,
  });

  // Replace album-artist + track rows so a partial history cache becomes a full album.
  await MusicAlbumArtist.destroy({ where: { albumId: detail.id } });
  await MusicAlbumArtist.bulkCreate(albumArtists, { ignoreDuplicates: true });

  for (const track of tracks) {
    await MusicTrack.upsert(track);
  }
  await MusicTrackArtist.bulkCreate(trackArtists, { ignoreDuplicates: true });
}

/**
 * Album detail with tracks and artists. Prefers a complete Music* cache row,
 * otherwise fetches from Spotify and writes through so the next load is local.
 * Returns null when Spotify reports the album missing (or the cache is empty
 * and Spotify is unavailable with a 404).
 */
export async function fetchAlbumDetail(albumId: string): Promise<AlbumDetail | null> {
  const cached = await readAlbumFromDb(albumId);
  if (cached) {
    return cached;
  }

  const live = await fetchAlbumFromSpotify(albumId);
  if (!live) {
    return null;
  }

  await writeAlbumThrough(live);
  return live;
}
