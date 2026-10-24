import 'server-only';

import type { MusicArtist } from '@dg/db/models/MusicArtist';

/** A Spotify artist, album, playlist, or track named somewhere on the site, with the page it opens. */
export type SpotifyLink = { id: string; name: string; url: string };

type SpotifyKind = 'album' | 'artist' | 'playlist' | 'track';

type PositionedArtist = MusicArtist & {
  MusicAlbumArtist?: { position: number };
  MusicTrackArtist?: { position: number };
};

/** The stored Spotify page, or the canonical one built from the id when none was stored. */
export function spotifyUrl(kind: SpotifyKind, id: string, url?: string | null): string {
  return url || `https://open.spotify.com/${kind}/${id}`;
}

function artistPosition(artist: PositionedArtist): number {
  return artist.MusicAlbumArtist?.position ?? artist.MusicTrackArtist?.position ?? 0;
}

/** Sorts joined `MusicArtist` rows by their junction `position` and links each to Spotify. */
export function toOrderedArtistLinks(
  artists: ReadonlyArray<MusicArtist> | undefined,
): Array<SpotifyLink> {
  return [...(artists ?? [])]
    .sort((a, b) => artistPosition(a as PositionedArtist) - artistPosition(b as PositionedArtist))
    .map((artist) => ({
      id: artist.id,
      name: artist.name,
      url: spotifyUrl('artist', artist.id, artist.url),
    }));
}
