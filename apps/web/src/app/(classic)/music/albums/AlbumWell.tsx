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
import {
  ALBUM_WELL_ART_SIZE_XS,
  ALBUM_WELL_NAME_GAP,
  ALBUM_WELL_NAME_LINE,
  ALBUM_WELL_STICKY_TOP,
  albumWellTextGridSx,
} from './albumWellStyles';
import styles from './FavoriteAlbums.module.css';

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
 *
 * Switching straight from one album to another swaps a tracklist of dozens of
 * rows for a placeholder of six, so without a floor the card — and every grid row
 * under it — drops by the difference (~3300px at 1280) in the frame the click
 * commits, then climbs back as the real tracklist arrives. Holding the floor
 * turns that shrink-then-grow into a single eased step.
 *
 * `:has()` is what releases it: the moment real detail replaces the placeholder
 * the floor stops applying, the card falls to its natural height, and the resize
 * observer below tweens that one change. Nothing has to decide when detail has
 * "really" arrived — the URL lands well before the streamed tracklist does, so
 * every signal short of the placeholder's own absence releases too early.
 */
function reserveSx(reservePx: number | null): SxObject {
  return reservePx == null
    ? {}
    : { '&:has([data-role="album-detail-placeholder"])': { minHeight: reservePx } };
}

const wellSx: SxObject = {
  ...albumWellVtNameSx,
  // Content-height rows, so the floor below leaves its slack at the bottom of the
  // card. Stretching would spread it between the name, meta, and tracklist rows
  // and push everything but the title past the fold while the placeholder is up.
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

/**
 * The one thing in the well that pins, and the only thing that can: it has its
 * own column from `sm` up, so it travels beside the tracklist without ever
 * covering a row. Grid items stretch by default, which would both leave the
 * anchor covering the empty column beside the tracklist and give sticky no room
 * to travel inside the grid area.
 *
 * Static on mobile, where the single column puts it directly over the rows and
 * a pinned 160px cover claimed a fifth of the viewport with bare strips either
 * side of a centred square for the tracklist to scroll through.
 */
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

const collageWellSx: SxObject = {
  alignContent: 'start',
  columnGap: { sm: '36px', xs: 0 },
  display: 'grid',
  gridTemplateAreas: {
    sm: '"art name" "art meta" "art tracks"',
    xs: '"art" "name" "meta" "tracks"',
  },
  gridTemplateColumns: {
    sm: 'minmax(200px, 300px) minmax(0, 1fr)',
    xs: '1fr',
  },
  p: { sm: '36px 40px 40px', xs: '22px 20px 26px' },
  rowGap: 0,
};

const collageArtCardSx: SxObject = {
  '& img': {
    display: 'block',
    height: 'auto',
    width: '100%',
  },
  clipPath: 'var(--quad-b)',
  lineHeight: 0,
  overflow: 'hidden',
  width: '100%',
};

const collageArtLinkSx: SxObject = {
  alignSelf: 'start',
  display: 'block',
  gridArea: 'art',
  justifySelf: { sm: 'stretch', xs: 'center' },
  maxWidth: { sm: 300, xs: 220 },
  mb: { sm: 0, xs: '22px' },
  position: 'relative',
  width: '100%',
};

const collageNameSx: SxObject = {
  fontFamily: 'var(--display)',
  fontSize: 'clamp(36px, 4vw, 56px)',
  fontWeight: 700,
  gridArea: 'name',
  letterSpacing: '-0.03em',
  lineHeight: 0.95,
  minWidth: 0,
};

const collageNameLinkSx: SxObject = {
  lineHeight: 'inherit',
  minWidth: 0,
  overflowWrap: 'anywhere',
};

type AlbumWellSurfaceStyles = {
  artCard: SxObject;
  artLink: SxObject;
  name: SxObject;
  nameLink: SxObject;
  well: SxObject;
};

const ALBUM_WELL_SURFACE_STYLES = {
  classic: {
    artCard: artCardSx,
    artLink: artLinkSx,
    name: nameSx,
    nameLink: nameLinkSx,
    well: wellSx,
  },
  collage: {
    artCard: collageArtCardSx,
    artLink: collageArtLinkSx,
    name: collageNameSx,
    nameLink: collageNameLinkSx,
    well: collageWellSx,
  },
} satisfies Record<SiteSurface, AlbumWellSurfaceStyles>;

/**
 * Outer shell height. Locked to a pixel value only while a content resize is
 * tweening, then released to `auto`.
 *
 * `clip` rather than `hidden`: `hidden` makes this a scroll container, which
 * re-parents the well's sticky art and name band to it. Their `top` offsets then
 * apply against a box scrolled to 0, so both slid ~100px down the card the frame
 * the height locked and snapped back when it released. `clip` hides the same
 * overflow without a scrollport, leaving sticky anchored to the page.
 */
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
    // Same tier as SpotifyHeaderCard's fr expand, but medium — open felt slow at slow.
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
 *
 * Open/close height is a view-transition clip on `album-well` (scoped to
 * album-open/close only). After open, content that lands later — placeholder →
 * tracklist — resizes the shell with a measured height tween so the change never
 * reads as a jolt, then releases back to `auto` for sticky.
 *
 * Switching straight from one album to another goes further and floors the card
 * at the outgoing height until the arriving tracklist replaces the placeholder,
 * so that swap costs the page no layout at all. See `reserveSx`.
 */
export function AlbumWell({ album, children, surface = 'classic' }: Props) {
  const measureRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number | null>(null);
  const [heightPx, setHeightPx] = useState<number | null>(null);
  const [reservePx, setReservePx] = useState<number | null>(null);
  const [openAlbumId, setOpenAlbumId] = useState(album.id);

  if (album.id !== openAlbumId) {
    // Claim the reserve in the same render that swaps the content in, so the
    // placeholder never gets a frame at its own height to paint at. The shell is
    // pinned to the same height as well: the floor drops the instant real detail
    // replaces the placeholder, but the tween that follows can only start on the
    // next resize observation, and an `auto` shell would reflow in between.
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

      // Two-stage tween: pin the outgoing height, then ease to the new content.
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
    // The reserve has already been released by the placeholder leaving; dropping
    // it here keeps a stale floor from applying to some later placeholder.
    setReservePx(null);
    lastHeightRef.current = measureRef.current?.scrollHeight ?? lastHeightRef.current;
  };

  const surfaceStyles = ALBUM_WELL_SURFACE_STYLES[surface];
  const well = (
    <Box
      aria-label={`${album.name} details`}
      className={surface === 'collage' ? styles.collageWell : undefined}
      component="section"
      data-surface={surface === 'collage' ? 'collage' : undefined}
      sx={{ ...surfaceStyles.well, ...reserveSx(reservePx) }}
    >
      <Link
        className={surface === 'collage' ? styles.collageWellArt : undefined}
        href={album.url}
        isExternal={true}
        sx={surfaceStyles.artLink}
        title={`Open ${album.name} on Spotify`}
      >
        <ViewTransition
          default="none"
          name={albumArtViewTransitionName(album.id)}
          share="vt-album-art"
        >
          <Box
            className={surface === 'collage' ? styles.fullColorArt : undefined}
            data-image-treatment={surface === 'collage' ? 'full-color' : undefined}
            sx={surfaceStyles.artCard}
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
        {surface === 'collage' ? (
          <>
            <PaperTag
              className={styles.collageWellAlbumTag}
              edge="quad-c"
              tiltDeg={-5}
              tone="ochre"
            >
              <span>Album</span>
              <small>{album.releaseDate.slice(0, 4)}</small>
            </PaperTag>
            <PaperTag
              className={styles.collageWellSpotifyTag}
              edge="quad-c"
              tiltDeg={3}
              tone="cream"
            >
              Spotify ↗
            </PaperTag>
          </>
        ) : null}
      </Link>

      <Box sx={{ display: 'contents' }}>
        <Typography
          className={surface === 'collage' ? styles.collageWellName : undefined}
          component="h2"
          sx={surfaceStyles.name}
          variant="h2"
        >
          <Link href={album.url} isExternal={true} sx={surfaceStyles.nameLink} title={album.name}>
            {album.name}
          </Link>
        </Typography>
        {children}
      </Box>
    </Box>
  );

  return (
    <Box onTransitionEnd={handleTransitionEnd} sx={shellSx(heightPx)}>
      <Box ref={measureRef}>
        {surface === 'collage' ? (
          <PaperCard
            className={styles.collageWellCard}
            edge="torn-c"
            innerClassName={styles.collageWellInner}
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
