import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import {
  ALBUM_WELL_TRACK_COLUMN_GAP,
  ALBUM_WELL_TRACK_NUMBER_COLUMN,
  albumWellMetaRowSx,
  albumWellMetaTextSx,
} from './albumWellStyles';
import styles from './albumWell.module.css';

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

/** Cancels its own padding so the number column stays in the well's gutter. */
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

const collageFactsRowSx: SxObject = {
  '& p': {
    fontSize: '15px',
    fontWeight: 700,
    lineHeight: 1.4,
  },
  alignItems: 'start',
  color: 'inherit',
  display: 'grid',
  letterSpacing: '0.07em',
  rowGap: '14px',
  textTransform: 'uppercase',
};

const collageMetaRowSx: SxObject = {
  gridArea: 'meta',
  mt: '10px',
};

const collageMetaTextSx: SxObject = {
  display: 'grid',
  minWidth: 0,
  rowGap: '6px',
};

const collageArtistTextSx: SxObject = {
  ...overflowTextSx,
  color: 'inherit',
  fontSize: '20px',
  fontWeight: 700,
};

const collageTrackTitleTextSx: SxObject = {
  ...overflowTextSx,
  fontSize: '18px',
};

const collageTrackArtistTextSx: SxObject = {
  ...overflowTextSx,
  opacity: 0.82,
};

const collageTrackListSx: SxObject = {
  columnCount: { md: 2, xs: 1 },
  columnGap: '34px',
  display: 'block',
  fontSize: '18px',
  gridArea: 'tracks',
  lineHeight: 1.45,
  listStyle: 'none',
  m: 0,
  mt: '22px',
  p: 0,
};

const collageTrackRowSx: SxObject = {
  alignItems: 'center',
  breakInside: 'avoid',
  columnGap: '10px',
  display: 'grid',
  gridTemplateColumns: `${ALBUM_WELL_TRACK_NUMBER_COLUMN} minmax(0, 1fr) auto`,
  py: '6px',
};

const collagePopularitySx: SxObject = {
  display: 'block',
  height: 10,
  maxWidth: '100%',
  position: 'relative',
  width: 240,
};

const collagePopularityTrackSx: SxObject = {
  backgroundColor: 'var(--cream)',
  clipPath: 'var(--quad-c)',
  height: 10,
  overflow: 'hidden',
  width: '100%',
};

const collagePopularityFillSx: SxObject = {
  backgroundColor: 'var(--ochre)',
  height: '100%',
};

type AlbumDetailSurfaceStyles = {
  artistText: SxObject;
  factsRow: SxObject;
  metaRow: SxObject;
  metaText: SxObject;
  popularity: SxObject;
  popularityFill: SxObject;
  popularityTrack: SxObject;
  trackArtistText: SxObject;
  trackList: SxObject;
  trackRow: SxObject;
  trackTitleText: SxObject;
};

const ALBUM_DETAIL_SURFACE_STYLES = {
  classic: {
    artistText: overflowTextSx,
    factsRow: factsRowSx,
    metaRow: albumWellMetaRowSx,
    metaText: albumWellMetaTextSx,
    popularity: popularitySx,
    popularityFill: popularityFillSx,
    popularityTrack: popularityTrackSx,
    trackArtistText: overflowTextSx,
    trackList: trackListSx,
    trackRow: trackRowSx,
    trackTitleText: overflowTextSx,
  },
  collage: {
    artistText: collageArtistTextSx,
    factsRow: collageFactsRowSx,
    metaRow: collageMetaRowSx,
    metaText: collageMetaTextSx,
    popularity: collagePopularitySx,
    popularityFill: collagePopularityFillSx,
    popularityTrack: collagePopularityTrackSx,
    trackArtistText: collageTrackArtistTextSx,
    trackList: collageTrackListSx,
    trackRow: collageTrackRowSx,
    trackTitleText: collageTrackTitleTextSx,
  },
} satisfies Record<SiteSurface, AlbumDetailSurfaceStyles>;

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

/**
 * A named gauge rather than a bare number trailing the facts, which read as a
 * stray year. The label and value are hidden from the tree because the wrapper
 * already speaks both.
 */
function Popularity({ surface, value }: { surface: SiteSurface; value: number }) {
  const surfaceStyles = ALBUM_DETAIL_SURFACE_STYLES[surface];
  return (
    <Box aria-label={`Popularity ${value} out of 100`} role="img" sx={surfaceStyles.popularity}>
      <Typography
        aria-hidden
        component="span"
        sx={surface === 'collage' ? { display: 'none' } : undefined}
        variant="caption"
      >
        Popularity
      </Typography>
      <Box sx={surfaceStyles.popularityTrack}>
        <Box sx={{ ...surfaceStyles.popularityFill, width: `${value}%` }} />
      </Box>
      <Typography
        aria-hidden
        component="span"
        sx={
          surface === 'collage'
            ? { display: 'none' }
            : { ...tabularSx, color: 'text.primary', fontWeight: 700 }
        }
        variant="body2"
      >
        {value}
      </Typography>
    </Box>
  );
}

/**
 * The part of the well that needs a fetch: artist links, album meta, and the
 * numbered tracklist. Everything sits on the well's shared text edge, with
 * track numbers hanging in the gutter the well reserves to its left.
 */
export function AlbumDetailBody({
  album,
  surface = 'classic',
}: {
  album: AlbumDetail;
  surface?: SiteSurface;
}) {
  const surfaceStyles = ALBUM_DETAIL_SURFACE_STYLES[surface];
  const facts = [
    album.releaseDate ? album.releaseDate.slice(0, 4) : null,
    `${album.totalTracks} track${album.totalTracks === 1 ? '' : 's'}`,
    album.durationMs > 0 ? formatDuration(album.durationMs) : null,
  ].filter(Boolean);

  return (
    <Box sx={{ display: 'contents' }}>
      <Box sx={surfaceStyles.metaRow}>
        <Box
          className={surface === 'collage' ? styles.wellMeta : undefined}
          data-role="album-meta"
          sx={surfaceStyles.metaText}
        >
          <Typography
            color={surface === 'collage' ? 'inherit' : 'text.secondary'}
            component="h3"
            data-role="album-artists"
            sx={surfaceStyles.artistText}
            variant="h4"
          >
            {album.artists.map((artist, index) => (
              <span key={artist.id}>
                {index > 0 ? ', ' : null}
                <Link href={artist.url} isExternal={true} title={`Open ${artist.name} on Spotify`}>
                  {artist.name}
                </Link>
              </span>
            ))}
          </Typography>
          <Box sx={surfaceStyles.factsRow}>
            <Typography component="p" sx={tabularSx} variant="body2">
              {facts.join(' · ')}
            </Typography>
            {album.popularity == null ? null : (
              <Popularity surface={surface} value={album.popularity} />
            )}
          </Box>
        </Box>
      </Box>

      <Box component="ol" data-role="track-list" sx={surfaceStyles.trackList}>
        {album.tracks.map((track) => (
          <Box
            className={surface === 'collage' ? styles.trackRow : undefined}
            component="li"
            data-role="track-row"
            key={track.id}
            sx={surfaceStyles.trackRow}
          >
            <Typography
              color={surface === 'collage' ? 'inherit' : 'text.secondary'}
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
                sx={surfaceStyles.trackTitleText}
                title={track.name}
                variant="body2"
              >
                <Link href={track.url} isExternal={true} title={`Open ${track.name} on Spotify`}>
                  {track.name}
                </Link>
              </Typography>
              <Typography
                color={surface === 'collage' ? 'inherit' : 'text.secondary'}
                data-role="track-artists"
                sx={surfaceStyles.trackArtistText}
                title={track.artists.map((artist) => artist.name).join(', ')}
                variant="caption"
              >
                {track.artists.map((artist, index) => (
                  <span key={`${track.id}-${artist.id}`}>
                    {index > 0 ? ', ' : null}
                    <Link
                      href={artist.url}
                      isExternal={true}
                      title={`Open ${artist.name} on Spotify`}
                    >
                      {artist.name}
                    </Link>
                  </span>
                ))}
              </Typography>
            </Box>
            <Typography
              color={surface === 'collage' ? 'inherit' : 'text.secondary'}
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
