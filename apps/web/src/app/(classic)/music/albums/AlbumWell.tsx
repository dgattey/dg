'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { albumArtViewTransitionName } from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_DEFAULT, TIMING_MEDIUM } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import { Box, Typography } from '@mui/material';
import type { ReactNode, TransitionEvent } from 'react';
import { useLayoutEffect, useRef, useState, ViewTransition } from 'react';
import { PaperCard } from '../../../collage/PaperCard';
import { PaperTag } from '../../../collage/PaperTag';
import styles from '../music.module.css';
import {
  ALBUM_WELL_ART_SIZE_XS,
  ALBUM_WELL_NAME_GAP,
  ALBUM_WELL_NAME_LINE,
  ALBUM_WELL_STICKY_TOP,
  albumWellTextGridSx,
} from './albumWellStyles';

const WELL_ART_SIZE = 220;

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

/**
 * Claimed only while an album open/close is photographing. A persistent name
 * would be swept into page navigations and steal the well (and anything nested)
 * out of those snapshots — the same trap that blanked the header disc.
 */
const albumWellVtNameSx: SxObject = {
  'html:active-view-transition-type(album-close) &, html:active-view-transition-type(album-open) &':
    {
      viewTransitionName: 'album-well',
    },
};

/**
 * Floor the card at the height the outgoing album's detail measured, for exactly
 * as long as a placeholder is standing in for detail that has not landed.
 */
function reserveSx(reservePx: number | null): SxObject {
  return reservePx == null
    ? {}
    : { '&:has([data-role="album-detail-placeholder"])': { minHeight: reservePx } };
}

const wellSx: SxObject = {
  ...albumWellVtNameSx,
  alignContent: 'start',
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

const artLinkSx: SxObject = {
  alignSelf: 'start',
  display: 'block',
  gridArea: 'art',
  justifySelf: { sm: 'stretch', xs: 'center' },
  maxWidth: { sm: WELL_ART_SIZE, xs: ALBUM_WELL_ART_SIZE_XS },
  position: { sm: 'sticky', xs: 'static' },
  top: ALBUM_WELL_STICKY_TOP,
  width: '100%',
};

const nameSx: SxObject = {
  ...albumWellTextGridSx,
  fontWeight: 700,
  gridArea: 'name',
  pb: ALBUM_WELL_NAME_GAP,
};

/** One line, so a long title can't reflow the card while detail streams in. */
const nameLinkSx: SxObject = {
  gridColumn: 2,
  lineHeight: ALBUM_WELL_NAME_LINE,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

function shellSx(heightPx: number | null): SxObject {
  const locking = heightPx != null;
  return {
    [REDUCED_MOTION]: {
      height: 'auto',
      overflow: 'visible',
      transition: 'none',
    },
    height: locking ? heightPx : 'auto',
    overflow: locking ? 'clip' : 'visible',
    transition: locking ? createTransition('height', TIMING_MEDIUM, EASING_DEFAULT) : undefined,
  };
}

type Props = {
  /** Header data the grid already holds, so art is up before detail streams. */
  album: PlaylistAlbum;
  /** Streamed detail: artist links, meta, and the tracklist. */
  children?: ReactNode;
  surface?: SiteSurface;
};

/**
 * Expanded album well. Art and title come from the grid so the shared art name
 * is on screen the instant the URL changes and the morph has somewhere to land;
 * everything that needs a fetch arrives as children.
 */
export function AlbumWell({ album, children, surface = 'classic' }: Props) {
  const measureRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number | null>(null);
  const [heightPx, setHeightPx] = useState<number | null>(null);
  const [reservePx, setReservePx] = useState<number | null>(null);
  const [openAlbumId, setOpenAlbumId] = useState(album.id);
  const isCollage = surface === 'collage';

  if (album.id !== openAlbumId) {
    setOpenAlbumId(album.id);
    setReservePx(lastHeightRef.current);
    setHeightPx(lastHeightRef.current);
  }

  useLayoutEffect(() => {
    const node = measureRef.current;
    if (!node || typeof ResizeObserver === 'undefined') {
      return;
    }

    const reducedMotion = () =>
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const observer = new ResizeObserver(() => {
      const next = node.scrollHeight;
      const previous = lastHeightRef.current;
      lastHeightRef.current = next;

      if (previous == null || reducedMotion() || previous === next) {
        return;
      }

      setHeightPx(previous);
      requestAnimationFrame(() => {
        setHeightPx(next);
      });
    });

    observer.observe(node);
    lastHeightRef.current = node.scrollHeight;

    return () => observer.disconnect();
  }, []);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'height' || event.target !== event.currentTarget) {
      return;
    }
    setHeightPx(null);
    setReservePx(null);
    lastHeightRef.current = measureRef.current?.scrollHeight ?? lastHeightRef.current;
  };

  const art = (
    <Link
      className={isCollage ? styles.wellArtLink : undefined}
      href={album.url}
      isExternal={true}
      sx={isCollage ? undefined : artLinkSx}
      title={`Open ${album.name} on Spotify`}
    >
      <ViewTransition
        default="none"
        name={albumArtViewTransitionName(album.id)}
        share="vt-album-art"
      >
        <Box
          className={isCollage ? `${styles.wellArtCard} ${styles.fullColorArt}` : undefined}
          sx={isCollage ? undefined : artCardSx}
        >
          <Image
            alt={album.name}
            height={WELL_ART_SIZE}
            sizes={{ extraLarge: WELL_ART_SIZE, medium: WELL_ART_SIZE, tiny: 160 }}
            url={album.imageUrl}
            width={WELL_ART_SIZE}
          />
        </Box>
      </ViewTransition>
      {isCollage ? (
        <>
          <PaperTag
            className={`collagePin ${styles.wellAlbumTag}`}
            edge="quad-c"
            tiltDeg={-5}
            tone="ochre"
          >
            <span>Album</span>
            <small>{album.releaseDate.slice(0, 4)}</small>
          </PaperTag>
          <PaperTag
            className={`collagePin ${styles.wellSpotifyTag}`}
            edge="quad-c"
            tiltDeg={3}
            tone="cream"
          >
            Spotify ↗
          </PaperTag>
        </>
      ) : null}
    </Link>
  );

  const title = isCollage ? (
    <h2 className={styles.wellName}>
      <Link href={album.url} isExternal={true} title={album.name}>
        {album.name}
      </Link>
    </h2>
  ) : (
    <Typography component="h2" sx={nameSx} variant="h2">
      <Link href={album.url} isExternal={true} sx={nameLinkSx} title={album.name}>
        {album.name}
      </Link>
    </Typography>
  );

  const well = (
    <Box
      aria-label={`${album.name} details`}
      className={isCollage ? styles.wellShell : undefined}
      component="section"
      sx={isCollage ? reserveSx(reservePx) : { ...wellSx, ...reserveSx(reservePx) }}
    >
      {art}
      <Box sx={{ display: 'contents' }}>
        {title}
        {children}
      </Box>
    </Box>
  );

  return (
    <Box onTransitionEnd={handleTransitionEnd} sx={shellSx(heightPx)}>
      <Box ref={measureRef}>
        {isCollage ? (
          <PaperCard
            className={styles.wellCard}
            edge="torn-c"
            innerClassName={styles.wellInner}
            tiltDeg={-0.7}
            tone="viridian"
          >
            {well}
          </PaperCard>
        ) : (
          well
        )}
      </Box>
    </Box>
  );
}
