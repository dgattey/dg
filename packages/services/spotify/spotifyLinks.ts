import 'server-only';

/** A Spotify artist, album, or track named somewhere on the site, with the page it opens. */
export type SpotifyLink = { id: string; name: string; url: string };

type SpotifyKind = 'album' | 'artist' | 'track';

/** The stored Spotify page, or the canonical one built from the id when none was stored. */
export function spotifyUrl(kind: SpotifyKind, id: string, url?: string | null): string {
  return url || `https://open.spotify.com/${kind}/${id}`;
}
