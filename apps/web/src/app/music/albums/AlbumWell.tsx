'use client';

import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import {
  albumArtViewTransitionName,
  albumTransitionTypes,
} from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';
import { X } from 'lucide-react';

const WELL_ART_SIZE = 220;

const wellSx: SxObject = {
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 88%, transparent)',
  border: '1px solid color-mix(in srgb, CanvasText 10%, transparent)',
  borderRadius: 3,
  boxShadow: `
    inset 0 1px 0 color-mix(in srgb, var(--mui-palette-common-white) 12%, transparent),
    0 8px 28px color-mix(in srgb, var(--mui-palette-common-black) 8%, transparent)`,
  display: 'grid',
  gap: { sm: 3, xs: 2 },
  gridColumn: '1 / -1',
  gridTemplateColumns: {
    sm: `${WELL_ART_SIZE}px minmax(0, 1fr)`,
    xs: '1fr',
  },
  p: { sm: 3, xs: 2 },
  position: 'relative',
};

const artCardSx: SxObject = {
  borderRadius: 2,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  lineHeight: 0,
  overflow: 'hidden',
  viewTransitionName: 'none',
  width: '100%',
};

const artLinkSx: SxObject = {
  display: 'block',
  justifySelf: { sm: 'stretch', xs: 'center' },
  maxWidth: WELL_ART_SIZE,
  width: '100%',
};

const closeLinkSx: SxObject = {
  alignItems: 'center',
  alignSelf: 'flex-start',
  color: 'text.secondary',
  display: 'inline-flex',
  gap: 0.5,
  justifySelf: { sm: 'end', xs: 'start' },
};

const trackRowSx: SxObject = {
  '&:hover': {
    backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 8%, transparent)',
  },
  alignItems: 'baseline',
  borderRadius: 1,
  columnGap: 1.5,
  display: 'grid',
  gridTemplateColumns: '2.5rem minmax(0, 1fr) auto',
  px: 1,
  py: 0.75,
};

const metaChipSx: SxObject = {
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
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

function releaseYear(releaseDate: string | null): string | null {
  if (!releaseDate) {
    return null;
  }
  return releaseDate.slice(0, 4);
}

type Props = {
  album: AlbumDetail;
};

/**
 * Expanded album well: large art (shared VT with the grid cell), meta, and a
 * numbered tracklist. Art / title / artists / tracks link out to Spotify.
 */
export function AlbumWell({ album }: Props) {
  const year = releaseYear(album.releaseDate);
  const metaParts = [
    year,
    `${album.totalTracks} track${album.totalTracks === 1 ? '' : 's'}`,
    album.durationMs > 0 ? formatDuration(album.durationMs) : null,
    album.label,
    album.popularity != null ? `Popularity ${album.popularity}` : null,
  ].filter(Boolean);

  return (
    <Box aria-label={`${album.name} details`} component="section" sx={wellSx}>
      <Link
        href={album.url}
        isExternal={true}
        sx={artLinkSx}
        title={`Open ${album.name} on Spotify`}
      >
        <Box
          sx={{
            ...artCardSx,
            viewTransitionName: albumArtViewTransitionName(album.id),
          }}
        >
          <Image
            alt={album.name}
            height={WELL_ART_SIZE}
            sizes={{ extraLarge: WELL_ART_SIZE, medium: WELL_ART_SIZE, tiny: 160 }}
            url={album.imageUrl}
            width={WELL_ART_SIZE}
          />
        </Box>
      </Link>

      <Stack spacing={2} sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={{ fontWeight: 700, mb: 0.5 }} variant="h3">
              <Link href={album.url} isExternal={true} title={album.name}>
                {album.name}
              </Link>
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }} variant="body1">
              {album.artists.map((artist, index) => (
                <span key={artist.id}>
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
            {metaParts.length > 0 ? (
              <Typography component="p" sx={metaChipSx} variant="body2">
                {metaParts.join(' · ')}
              </Typography>
            ) : null}
          </Box>
          <Link
            href={favoriteAlbumsRoute}
            sx={closeLinkSx}
            title="Close album"
            transitionTypes={albumTransitionTypes('close')}
          >
            <X aria-hidden size={16} />
            <Typography component="span" variant="caption">
              Close
            </Typography>
          </Link>
        </Stack>

        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {album.tracks.map((track) => (
            <Box component="li" key={track.id} sx={trackRowSx}>
              <Typography
                color="text.secondary"
                component="span"
                sx={{ fontVariantNumeric: 'tabular-nums', textAlign: 'end' }}
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
              <Typography color="text.secondary" component="span" sx={metaChipSx} variant="caption">
                {formatTrackDuration(track.durationMs)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}
