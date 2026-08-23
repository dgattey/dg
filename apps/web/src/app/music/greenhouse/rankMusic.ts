import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { HistoryTrack } from '@dg/services/spotify/fetchMusicHistoryPage';
import type { RankedAlbum, RankedArtist, RankedTrack } from './types';

export const TOP_TRACKS = 8;
export const TOP_ARTISTS = 8;
export const ON_REPEAT_ALBUMS = 3;

type Counted<T> = T & { playCount: number };

function byPlayCountThenName<T extends { playCount: number; name?: string; title?: string }>(
  left: T,
  right: T,
) {
  if (right.playCount !== left.playCount) {
    return right.playCount - left.playCount;
  }
  return (left.title ?? left.name ?? '').localeCompare(right.title ?? right.name ?? '');
}

/**
 * Rank recent plays by track identity. One page of history is enough for the
 * greenhouse lists; there is no separate top-tracks snapshot.
 */
export function rankTracks(
  tracks: ReadonlyArray<HistoryTrack>,
  limit = TOP_TRACKS,
): Array<RankedTrack> {
  const counts = new Map<string, Counted<RankedTrack>>();
  for (const track of tracks) {
    const existing = counts.get(track.trackId);
    if (existing) {
      existing.playCount += 1;
      continue;
    }
    counts.set(track.trackId, {
      artist: track.artistNames,
      id: track.trackId,
      imageUrl: track.albumImageUrl,
      playCount: 1,
      title: track.trackName,
      url: track.url,
    });
  }
  return [...counts.values()].sort(byPlayCountThenName).slice(0, limit);
}

/**
 * Rank artists from the joined `artistNames` on each play. Names are split on
 * commas so a collab counts for each person.
 */
export function rankArtists(
  tracks: ReadonlyArray<HistoryTrack>,
  limit = TOP_ARTISTS,
): Array<RankedArtist> {
  const counts = new Map<string, Counted<RankedArtist>>();
  for (const track of tracks) {
    const names = track.artistNames
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    for (const name of names) {
      const existing = counts.get(name);
      if (existing) {
        existing.playCount += 1;
        continue;
      }
      counts.set(name, {
        id: name,
        imageUrl: track.albumImageUrl,
        name,
        playCount: 1,
        url: track.url,
      });
    }
  }
  return [...counts.values()].sort(byPlayCountThenName).slice(0, limit);
}

/**
 * Albums heard most in this history page, filled from favorites when the page
 * is too thin to stock the on-repeat card.
 */
export function rankAlbums(
  tracks: ReadonlyArray<HistoryTrack>,
  favorites: ReadonlyArray<PlaylistAlbum> | null | undefined = [],
  limit = ON_REPEAT_ALBUMS,
): Array<RankedAlbum> {
  const counts = new Map<string, Counted<RankedAlbum>>();
  for (const track of tracks) {
    const id = track.albumId || `${track.albumName}|${track.albumImageUrl}`;
    const existing = counts.get(id);
    if (existing) {
      existing.playCount += 1;
      continue;
    }
    counts.set(id, {
      artistNames: track.artistNames,
      id,
      imageUrl: track.albumImageUrl,
      name: track.albumName,
      playCount: 1,
      url: track.albumUrl || track.url,
    });
  }

  const ranked = [...counts.values()].sort(byPlayCountThenName);
  if (ranked.length >= limit) {
    return ranked.slice(0, limit);
  }

  const seen = new Set(ranked.map((album) => album.id));
  for (const album of favorites ?? []) {
    if (seen.has(album.id)) {
      continue;
    }
    ranked.push({
      artistNames: album.artistNames,
      id: album.id,
      imageUrl: album.imageUrl,
      name: album.name,
      playCount: 0,
      url: album.url,
    });
    seen.add(album.id);
    if (ranked.length >= limit) {
      break;
    }
  }
  return ranked.slice(0, limit);
}
