'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { albumArtViewTransitionName } from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ViewTransition } from 'react';

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
  gridTemplateColumns: {
    sm: `${WELL_ART_SIZE}px minmax(0, 1fr)`,
    xs: '1fr',
  },
  p: { sm: 3, xs: 2 },
};

const artCardSx: SxObject = {
  '& img': {
    display: 'block',
    height: 'auto',
    width: '100%',
  },
  borderRadius: 2,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  lineHeight: 0,
  overflow: 'hidden',
  width: '100%',
};

const artLinkSx: SxObject = {
  // Grid items stretch by default, which would leave the anchor covering the
  // empty column beside the tracklist.
  alignSelf: 'start',
  display: 'block',
  justifySelf: { sm: 'stretch', xs: 'center' },
  maxWidth: WELL_ART_SIZE,
  width: '100%',
};

type Props = {
  /** Header data the grid already holds, so art is up before detail streams. */
  album: PlaylistAlbum;
  /** Streamed detail: artist links, meta, and the tracklist. */
  children?: ReactNode;
};

/**
 * Expanded album well. Art and title come from the grid so the shared art name
 * is on screen the instant the URL changes and the morph has somewhere to land;
 * everything that needs a fetch arrives as children.
 */
export function AlbumWell({ album, children }: Props) {
  return (
    <Box aria-label={`${album.name} details`} component="section" sx={wellSx}>
      <Link
        href={album.url}
        isExternal={true}
        sx={artLinkSx}
        title={`Open ${album.name} on Spotify`}
      >
        <ViewTransition name={albumArtViewTransitionName(album.id)} share="vt-album-art">
          <Box sx={artCardSx}>
            <Image
              alt={album.name}
              height={WELL_ART_SIZE}
              sizes={{ extraLarge: WELL_ART_SIZE, medium: WELL_ART_SIZE, tiny: 160 }}
              url={album.imageUrl}
              width={WELL_ART_SIZE}
            />
          </Box>
        </ViewTransition>
      </Link>

      <Stack spacing={1.5} sx={{ minWidth: 0 }}>
        <Typography component="h2" sx={{ fontWeight: 700 }} variant="h4">
          <Link href={album.url} isExternal={true} title={album.name}>
            {album.name}
          </Link>
        </Typography>
        {children}
      </Stack>
    </Box>
  );
}
