import type { AlbumDetail, AlbumDetailArtist } from '@dg/services/spotify/albumDetailTypes';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Link } from '@dg/ui/dependent/Link';
import type { CSSProperties, ReactNode } from 'react';

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

function artistNames(artists: ReadonlyArray<AlbumDetailArtist>): string {
  return artists.map((artist) => artist.name).join(', ');
}

function LinkedArtists({ artists }: { artists: ReadonlyArray<AlbumDetailArtist> }): ReactNode {
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
    <>
      <div className="music__wellMeta">
        <h3 className="music__wellArtists" data-typography="title-md">
          <Tooltip title={artistNames(album.artists)} whenTruncated>
            <span className="music__wellArtistsText">
              <LinkedArtists artists={album.artists} />
            </span>
          </Tooltip>
        </h3>
        <div className="music__wellFacts">
          <p data-typography="meta">{albumFacts(album).join(' · ')}</p>
          {album.popularity == null ? null : (
            <div
              aria-label={`Popularity ${album.popularity} out of 100`}
              className="music__wellPopularity"
              role="img"
            >
              <div className="music__wellPopularityTrack">
                <div
                  className="music__wellPopularityFill"
                  style={{ '--popularity': `${album.popularity}%` } as CSSProperties}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <ol className="music__wellTracks" data-typography="prose">
        {album.tracks.map((track) => (
          <li className="music__wellTrack" key={track.id}>
            <span className="music__wellTrackNumber">{track.trackNumber}</span>
            <span className="music__wellTrackBody">
              <Tooltip title={track.name} whenTruncated>
                <span className="music__wellTrackTitle">
                  <Link href={track.url} isExternal={true} title={`Open ${track.name} on Spotify`}>
                    {track.name}
                  </Link>
                </span>
              </Tooltip>
              <Tooltip title={artistNames(track.artists)} whenTruncated>
                <span className="music__wellTrackArtist">
                  <LinkedArtists artists={track.artists} />
                </span>
              </Tooltip>
            </span>
            <span className="music__wellTrackDuration">
              {formatTrackDuration(track.durationMs)}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
