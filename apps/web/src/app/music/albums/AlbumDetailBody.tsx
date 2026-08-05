import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';

const metaRowSx: SxObject = {
  alignItems: 'center',
  color: 'text.secondary',
  columnGap: 1,
  display: 'flex',
  flexWrap: 'wrap',
  rowGap: 0.5,
};

const tabularSx: SxObject = {
  fontVariantNumeric: 'tabular-nums',
};

/** Cancels its own padding so the number column starts on the well's text edge. */
const trackRowSx: SxObject = {
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)',
  },
  alignItems: 'baseline',
  borderRadius: 1,
  columnGap: 1.5,
  display: 'grid',
  mx: -1,
  px: 1,
  py: 0.75,
};

const POPULARITY_BAR_WIDTH = 56;

const popularityTrackSx: SxObject = {
  backgroundColor: 'color-mix(in srgb, CanvasText 14%, transparent)',
  borderRadius: 1,
  height: 6,
  overflow: 'hidden',
  width: POPULARITY_BAR_WIDTH,
};

const popularityFillSx: SxObject = {
  backgroundColor: 'primary.main',
  borderRadius: 'inherit',
  height: '100%',
};

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

/** Reads as a filled meter rather than a bare number, with the value spoken. */
function Popularity({ value }: { value: number }) {
  return (
    <Stack
      aria-label={`Popularity ${value} out of 100`}
      direction="row"
      role="img"
      spacing={0.75}
      sx={{ alignItems: 'center' }}
    >
      <Box sx={popularityTrackSx}>
        <Box sx={{ ...popularityFillSx, width: `${value}%` }} />
      </Box>
      <Typography aria-hidden component="span" sx={tabularSx} variant="body2">
        {value}
      </Typography>
    </Stack>
  );
}

/**
 * The part of the well that needs a fetch: artist links, album meta, and the
 * numbered tracklist. Track numbers sit in a column sized to the album's widest
 * number so titles line up no matter how long the record is.
 */
export function AlbumDetailBody({ album }: { album: AlbumDetail }) {
  const numberColumnCh = String(album.tracks.length).length + 1;
  const trackGridSx: SxObject = {
    ...trackRowSx,
    gridTemplateColumns: `${numberColumnCh}ch minmax(0, 1fr) auto`,
  };
  const facts = [
    album.releaseDate ? album.releaseDate.slice(0, 4) : null,
    `${album.totalTracks} track${album.totalTracks === 1 ? '' : 's'}`,
    album.durationMs > 0 ? formatDuration(album.durationMs) : null,
  ].filter(Boolean);

  return (
    <>
      <Typography color="text.secondary" variant="body1">
        {album.artists.map((artist, index) => (
          <span key={artist.id}>
            {index > 0 ? ', ' : null}
            <Link href={artist.url} isExternal={true} title={`Open ${artist.name} on Spotify`}>
              {artist.name}
            </Link>
          </span>
        ))}
      </Typography>

      <Box sx={metaRowSx}>
        <Typography component="p" sx={tabularSx} variant="body2">
          {facts.join(' · ')}
        </Typography>
        {album.popularity == null ? null : (
          <>
            <Typography aria-hidden component="span" variant="body2">
              ·
            </Typography>
            <Popularity value={album.popularity} />
          </>
        )}
      </Box>

      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {album.tracks.map((track) => (
          <Box component="li" key={track.id} sx={trackGridSx}>
            <Typography
              color="text.secondary"
              component="span"
              sx={{ ...tabularSx, textAlign: 'end' }}
              variant="body2"
            >
              {track.trackNumber}
            </Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap variant="body2">
                <Link href={track.url} isExternal={true} title={`Open ${track.name} on Spotify`}>
                  {track.name}
                </Link>
              </Typography>
              <Typography color="text.secondary" noWrap variant="caption">
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
            <Typography color="text.secondary" component="span" sx={tabularSx} variant="caption">
              {formatTrackDuration(track.durationMs)}
            </Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}
