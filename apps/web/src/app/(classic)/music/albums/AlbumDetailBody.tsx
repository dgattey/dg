import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import styles from '../music.module.css';
import {
  ALBUM_WELL_TRACK_COLUMN_GAP,
  ALBUM_WELL_TRACK_NUMBER_COLUMN,
  albumWellMetaRowSx,
  albumWellMetaTextSx,
} from './albumWellStyles';

const factsRowSx: SxObject = {
  alignItems: 'center',
  color: 'text.secondary',
  columnGap: 1.5,
  display: 'flex',
  flexWrap: 'wrap',
  rowGap: 1,
};

const tabularSx: SxObject = {
  fontVariantNumeric: 'tabular-nums',
};

const overflowTextSx: SxObject = {
  display: 'block',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  width: '100%',
};

const trackListSx: SxObject = {
  display: 'grid',
  gap: 0.5,
  gridArea: 'tracks',
  listStyle: 'none',
  m: 0,
  p: 0,
};

const trackRowSx: SxObject = {
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)',
  },
  alignItems: 'center',
  borderRadius: 1,
  columnGap: ALBUM_WELL_TRACK_COLUMN_GAP,
  display: 'grid',
  gridTemplateColumns: `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr) auto`,
  mx: -1,
  px: 1,
  py: 1,
};

const trackTextSx: SxObject = {
  display: 'grid',
  minWidth: 0,
  rowGap: 0.25,
};

const POPULARITY_METER_WIDTH = 72;

const popularitySx: SxObject = {
  alignItems: 'center',
  backgroundColor: 'color-mix(in srgb, CanvasText 5%, transparent)',
  borderRadius: '999px',
  boxShadow: 'inset 0 0 0 1px color-mix(in srgb, CanvasText 12%, transparent)',
  columnGap: 0.75,
  display: 'inline-flex',
  pl: 1.25,
  pr: 1,
  py: 0.5,
};

const popularityTrackSx: SxObject = {
  backgroundColor: 'color-mix(in srgb, CanvasText 16%, transparent)',
  borderRadius: '999px',
  height: 8,
  overflow: 'hidden',
  width: POPULARITY_METER_WIDTH,
};

const popularityFillSx: SxObject = {
  backgroundColor: 'primary.main',
  borderRadius: 'inherit',
  height: '100%',
};

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

function Popularity({ value }: { value: number }) {
  return (
    <Box aria-label={`Popularity ${value} out of 100`} role="img" sx={popularitySx}>
      <Typography aria-hidden component="span" variant="caption">
        Popularity
      </Typography>
      <Box sx={popularityTrackSx}>
        <Box sx={{ ...popularityFillSx, width: `${value}%` }} />
      </Box>
      <Typography
        aria-hidden
        component="span"
        sx={{ ...tabularSx, color: 'text.primary', fontWeight: 700 }}
        variant="body2"
      >
        {value}
      </Typography>
    </Box>
  );
}

function CollageAlbumDetail({ album }: { album: AlbumDetail }) {
  return (
    <div style={{ display: 'contents' }}>
      <div className={styles.wellMeta}>
        <div data-role="album-meta">
          <h3 className={styles.wellArtists} data-role="album-artists">
            <LinkedArtists artists={album.artists} />
          </h3>
          <div className={styles.wellFacts}>
            <p style={{ fontVariantNumeric: 'tabular-nums' }}>{albumFacts(album).join(' · ')}</p>
            {album.popularity == null ? null : (
              <div
                aria-label={`Popularity ${album.popularity} out of 100`}
                className={styles.wellPopularity}
                role="img"
              >
                <div className={styles.wellPopularityTrack}>
                  <div
                    className={styles.wellPopularityFill}
                    style={{ width: `${album.popularity}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ol className={styles.wellTracks} data-role="track-list">
        {album.tracks.map((track) => (
          <li className={styles.wellTrack} data-role="track-row" key={track.id}>
            <span
              data-role="track-number"
              style={{ alignSelf: 'start', fontVariantNumeric: 'tabular-nums', textAlign: 'end' }}
            >
              {track.trackNumber}
            </span>
            <span data-role="track-text" style={{ display: 'grid', minWidth: 0, rowGap: 2 }}>
              <span className={styles.wellTrackTitle} data-role="track-title" title={track.name}>
                <Link href={track.url} isExternal={true} title={`Open ${track.name} on Spotify`}>
                  {track.name}
                </Link>
              </span>
              <span
                className={styles.wellTrackArtist}
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

export function AlbumDetailBody({
  album,
  surface = 'classic',
}: {
  album: AlbumDetail;
  surface?: SiteSurface;
}) {
  if (surface === 'collage') {
    return <CollageAlbumDetail album={album} />;
  }

  return (
    <Box sx={{ display: 'contents' }}>
      <Box sx={albumWellMetaRowSx}>
        <Box data-role="album-meta" sx={albumWellMetaTextSx}>
          <Typography
            color="text.secondary"
            component="h3"
            data-role="album-artists"
            sx={overflowTextSx}
            variant="h4"
          >
            <LinkedArtists artists={album.artists} />
          </Typography>
          <Box sx={factsRowSx}>
            <Typography component="p" sx={tabularSx} variant="body2">
              {albumFacts(album).join(' · ')}
            </Typography>
            {album.popularity == null ? null : <Popularity value={album.popularity} />}
          </Box>
        </Box>
      </Box>

      <Box component="ol" data-role="track-list" sx={trackListSx}>
        {album.tracks.map((track) => (
          <Box component="li" data-role="track-row" key={track.id} sx={trackRowSx}>
            <Typography
              color="text.secondary"
              component="span"
              data-role="track-number"
              sx={{ ...tabularSx, alignSelf: 'start', textAlign: 'end' }}
              variant="body2"
            >
              {track.trackNumber}
            </Typography>
            <Box data-role="track-text" sx={trackTextSx}>
              <Typography
                data-role="track-title"
                sx={overflowTextSx}
                title={track.name}
                variant="body2"
              >
                <Link href={track.url} isExternal={true} title={`Open ${track.name} on Spotify`}>
                  {track.name}
                </Link>
              </Typography>
              <Typography
                color="text.secondary"
                data-role="track-artists"
                sx={overflowTextSx}
                title={track.artists.map((artist) => artist.name).join(', ')}
                variant="caption"
              >
                <LinkedArtists artists={track.artists} />
              </Typography>
            </Box>
            <Typography
              color="text.secondary"
              component="span"
              data-role="track-duration"
              sx={{ ...tabularSx, whiteSpace: 'nowrap' }}
              variant="caption"
            >
              {formatTrackDuration(track.durationMs)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
