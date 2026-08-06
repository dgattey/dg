'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { albumArtViewTransitionName } from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { ViewTransition } from 'react';

const WELL_ART_SIZE = 220;
const WELL_ART_SIZE_XS = 160;

/**
 * Track numbers hang in this gutter so the album name, the artist, the facts,
 * and every track title start on one edge. Fixed rather than measured off the
 * track count: the name is on screen before the tracklist streams in, so a
 * gutter that grew on arrival would shove the whole block sideways. A rem value
 * resolves identically for the h4 name and body rows (unlike `ch`), while 1.5rem
 * fits two tabular digits without looking loose on a three-track EP.
 */
export const TRACK_NUMBER_COLUMN = '1.5rem';

/** Splits the number gutter from the text edge everywhere the column is used. */
const TRACK_COLUMN_GAP = 1.5;

/**
 * The well's column structure: a gutter for track numbers, then the text edge
 * everything else shares. Bands span the gutter rather than starting after it
 * so a pinned background covers the numbers sliding underneath.
 */
const wellBandSx: SxObject = {
  columnGap: TRACK_COLUMN_GAP,
  display: 'grid',
  gridTemplateColumns: `${TRACK_NUMBER_COLUMN} minmax(0, 1fr)`,
};

/**
 * Opaque twin of the well's translucent surface. A pinned band needs it: mixed
 * with `transparent` instead, the tracklist reads straight through the header.
 */
const PINNED_SURFACE =
  'color-mix(in srgb, var(--mui-palette-background-paper) 88%, var(--mui-palette-background-default))';

/**
 * Clears the glass header and the sorter's reserved fade band. These values
 * match the responsive StickyFadeBar geometry; keeping the clearance here avoids
 * putting a named transition ancestor around the shared album art.
 */
const STICKY_TOP = {
  sm: 'calc(var(--site-header-height, 5.5rem) + 115px)',
  xs: 'calc(var(--site-header-height, 5.5rem) + 94px)',
} as const;

/** h4 is a flat 20.5px, so one line of the name is a height both bands can rely on. */
const NAME_LINE = '2rem';

/** The gap under the name, carried as padding so the pinned band stays unbroken. */
const NAME_GAP = '12px';

const wellSx: SxObject = {
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 88%, transparent)',
  border: '1px solid color-mix(in srgb, CanvasText 10%, transparent)',
  borderRadius: 3,
  boxShadow: `
    inset 0 1px 0 color-mix(in srgb, var(--mui-palette-common-white) 12%, transparent),
    0 8px 28px color-mix(in srgb, var(--mui-palette-common-black) 8%, transparent)`,
  columnGap: { sm: 3, xs: 0 },
  display: 'grid',
  gridTemplateAreas: {
    sm: '"art name" "art meta" "art tracks"',
    xs: '"art" "name" "meta" "tracks"',
  },
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

/**
 * Sticks alongside the pinned name and meta. Grid items stretch by default,
 * which would both leave the anchor covering the empty column beside the
 * tracklist and give sticky no room to travel inside the grid area.
 */
const artLinkSx: SxObject = {
  alignSelf: 'start',
  display: 'block',
  gridArea: 'art',
  justifySelf: { sm: 'stretch', xs: 'center' },
  maxWidth: { sm: WELL_ART_SIZE, xs: WELL_ART_SIZE_XS },
  position: 'sticky',
  top: STICKY_TOP,
  width: '100%',
};

const nameBandSx: SxObject = {
  ...wellBandSx,
  backgroundColor: PINNED_SURFACE,
  fontWeight: 700,
  gridArea: 'name',
  lineHeight: NAME_LINE,
  pb: NAME_GAP,
  position: 'sticky',
  top: {
    sm: STICKY_TOP.sm,
    xs: `calc(${STICKY_TOP.xs} + ${WELL_ART_SIZE_XS}px)`,
  },
  zIndex: 3,
};

/** One line so the band's height stays the constant the meta pins against. */
const nameLinkSx: SxObject = {
  gridColumn: 2,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
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

      <Box sx={{ display: 'contents' }}>
        <Typography component="h2" sx={nameBandSx} variant="h4">
          <Link href={album.url} isExternal={true} sx={nameLinkSx} title={album.name}>
            {album.name}
          </Link>
        </Typography>
        {children}
      </Box>
    </Box>
  );
}
