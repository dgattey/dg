import 'server-only';

import { Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { MusicTrack } from '@dg/db/models/MusicTrack';
import { MusicTrackArtist } from '@dg/db/models/MusicTrackArtist';
import { log } from '@dg/shared-core/logging/log';
import { type SpotifyLink, spotifyUrl, toOrderedArtistLinks } from './spotifyLinks';
import { mapInBatches } from './trackMetadataShared';
import { fetchTrackDisplayData, type TrackDisplayData } from './trackMetadataSingle';

/**
 * Display-ready track with its album and artists, each linked to its Spotify page.
 */
export type TrackDisplay = SpotifyLink & {
  album: SpotifyLink & { imageUrl: string };
  artists: Array<SpotifyLink>;
};

async function readCachedTracks(trackIds: Array<string>): Promise<Map<string, TrackDisplay>> {
  if (trackIds.length === 0) {
    return new Map();
  }

  try {
    const cachedTracks = await MusicTrack.findAll({
      attributes: ['id', 'name', 'url', 'albumId'],
      include: [
        {
          attributes: ['id', 'name', 'imageUrl', 'url'],
          model: MusicAlbum,
        },
        {
          attributes: ['id', 'name', 'url'],
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
          album: {
            id: track.album.id,
            imageUrl: track.album.imageUrl,
            name: track.album.name,
            url: spotifyUrl('album', track.album.id, track.album.url),
          },
          artists: toOrderedArtistLinks(track.artists),
          id: track.id,
          name: track.name,
          url: spotifyUrl('track', track.id, track.url),
        },
      ]),
    );
  } catch (error) {
    log.warn('Could not read cached tracks from database', { error });
    return new Map();
  }
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

  try {
    await MusicArtist.bulkCreate([...artists.values()], { ignoreDuplicates: true });
    await MusicAlbum.bulkCreate([...albums.values()], { ignoreDuplicates: true });
    await MusicTrack.bulkCreate(tracks, { ignoreDuplicates: true });
    await MusicTrackArtist.bulkCreate(trackArtists, { ignoreDuplicates: true });
  } catch (error) {
    log.warn('Could not persist track display cache to database', { error });
  }
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
  const fetched = await mapInBatches(
    uniqueIds.filter((id) => !displays.has(id)),
    fetchTrackDisplayData,
  );
  await cacheTrackData(fetched);
  for (const data of fetched) {
    displays.set(data.track.id, toTrackDisplay(data));
  }
  return displays;
}
