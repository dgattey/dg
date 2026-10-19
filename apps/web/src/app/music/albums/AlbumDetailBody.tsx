import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { Link } from '@dg/ui/dependent/Link';
import type { ReactNode } from 'react';

type LinkedArtist = { id: string; name: string; url: string };

function formatDuration(totalMs: number): string {
  const totalSeconds = Math.round(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  if (minutes > 0) {
    return `${minutes} min ${seconds.toString().padStart(2, '0')} sec`;
  }
  return `${seconds} sec`;
}

function formatTrackDuration(ms: number | null): string {
  if (ms == null) {
    return '—';
  }
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function albumFacts(album: AlbumDetail): Array<string> {
  return [
    album.releaseDate ? album.releaseDate.slice(0, 4) : null,
    `${album.totalTracks} track${album.totalTracks === 1 ? '' : 's'}`,
    album.durationMs > 0 ? formatDuration(album.durationMs) : null,
  ].filter((fact): fact is string => fact != null);
}

function LinkedArtists({ artists }: { artists: ReadonlyArray<LinkedArtist> }): ReactNode {
  return artists.map((artist, index) => (
    <span key={artist.id}>
      {index > 0 ? ', ' : null}
      <Link href={artist.url} isExternal={true} title={`Open ${artist.name} on Spotify`}>
        {artist.name}
      </Link>
    </span>
  ));
}

/**
 * The part of the well that needs a fetch: artist links, album meta, and the
 * numbered tracklist.
 */
export function AlbumDetailBody({ album }: { album: AlbumDetail }) {
  return (
    <div style={{ display: 'contents' }}>
      <div className="music__wellMeta">
        <div data-role="album-meta">
          <h3 className="music__wellArtists" data-role="album-artists">
            <LinkedArtists artists={album.artists} />
          </h3>
          <div className="music__wellFacts">
            <p style={{ fontVariantNumeric: 'tabular-nums' }}>{albumFacts(album).join(' · ')}</p>
            {album.popularity == null ? null : (
              <div
                aria-label={`Popularity ${album.popularity} out of 100`}
                className="music__wellPopularity"
                role="img"
              >
                <div className="music__wellPopularityTrack">
                  <div
                    className="music__wellPopularityFill"
                    style={{ width: `${album.popularity}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ol className="music__wellTracks" data-role="track-list">
        {album.tracks.map((track) => (
          <li className="music__wellTrack" data-role="track-row" key={track.id}>
            <span
              data-role="track-number"
              style={{ alignSelf: 'start', fontVariantNumeric: 'tabular-nums', textAlign: 'end' }}
            >
              {track.trackNumber}
            </span>
            <span data-role="track-text" style={{ display: 'grid', minWidth: 0, rowGap: 2 }}>
              <span className="music__wellTrackTitle" data-role="track-title" title={track.name}>
                <Link href={track.url} isExternal={true} title={`Open ${track.name} on Spotify`}>
                  {track.name}
                </Link>
              </span>
              <span
                className="music__wellTrackArtist"
                data-role="track-artists"
                title={track.artists.map((artist) => artist.name).join(', ')}
              >
                <LinkedArtists artists={track.artists} />
              </span>
            </span>
            <span
              data-role="track-duration"
              style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
            >
              {formatTrackDuration(track.durationMs)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
