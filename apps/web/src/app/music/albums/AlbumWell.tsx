'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { Box } from '@dg/ui/core/Box';
import { albumArtViewTransitionName } from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { createTransition, EASING_DEFAULT, TIMING_MEDIUM } from '@dg/ui/helpers/timing';
import type { SxObject } from '@dg/ui/theme';
import type { ReactNode, TransitionEvent } from 'react';
import { useLayoutEffect, useRef, useState, ViewTransition } from 'react';
import { ALBUM_DETAIL_BACKDROP } from '../../collage/backdrops';
import { CollageBackdrop } from '../../collage/CollageBackdrop';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import type { PaperTone } from '../../collage/types';

const WELL_ART_SIZE = 220;

/** The well art is 220px through its 820px stack and up to 300px beside the tracklist. */
const COLLAGE_WELL_ART_SIZES = { extraLarge: 300, large: 300, medium: 300, small: 220, tiny: 220 };

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

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
const shellUnlockedSx: SxObject = {
  height: 'auto',
  overflow: 'visible',
};

const shellLockedSx: SxObject = {
  [REDUCED_MOTION]: {
    height: 'auto',
    overflow: 'visible',
    transition: 'none',
  },
  overflow: 'clip',
  transition: createTransition('height', TIMING_MEDIUM, EASING_DEFAULT),
};

type Props = {
  /** Header data the grid already holds, so art is up before detail streams. */
  album: PlaylistAlbum;
  /** Streamed detail: artist links, meta, and the tracklist. */
  children?: ReactNode;
  /** The paper of the card that opened this well, so the two read as one. */
  tone?: PaperTone;
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
export function AlbumWell({ album, children, tone = 'viridian' }: Props) {
  const measureRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number | null>(null);
  const [heightPx, setHeightPx] = useState<number | null>(null);
  const [reservePx, setReservePx] = useState<number | null>(null);
  const [openAlbumId, setOpenAlbumId] = useState(album.id);

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
      className="music__wellArtLink"
      href={album.url}
      isExternal={true}
      title={`Open ${album.name} on Spotify`}
    >
      <ViewTransition
        default="none"
        name={albumArtViewTransitionName(album.id)}
        share="vt-album-art"
      >
        <Box className="music__wellArtCard">
          <Image
            alt={album.name}
            fetchPriority="high"
            height={WELL_ART_SIZE}
            preload={true}
            sizes={COLLAGE_WELL_ART_SIZES}
            url={album.imageUrl}
            width={WELL_ART_SIZE}
          />
        </Box>
      </ViewTransition>
      <PaperTag className="collagePin music__wellAlbumTag" edge="quad-c" tiltDeg={-5} tone="ochre">
        <span>Album</span>
        <small>{album.releaseDate.slice(0, 4)}</small>
      </PaperTag>
      <PaperTag className="collagePin music__wellSpotifyTag" edge="quad-c" tiltDeg={3} tone="cream">
        Spotify ↗
      </PaperTag>
    </Link>
  );

  const title = (
    <h2 className="music__wellName">
      <Link href={album.url} isExternal={true} title={album.name}>
        {album.name}
      </Link>
    </h2>
  );

  const well = (
    <Box
      aria-label={`${album.name} details`}
      className="music__wellShell"
      component="section"
      sx={reserveSx(reservePx)}
    >
      {art}
      {title}
      {children}
    </Box>
  );

  return (
    <Box
      onTransitionEnd={handleTransitionEnd}
      style={heightPx != null ? { height: heightPx } : undefined}
      sx={heightPx != null ? shellLockedSx : shellUnlockedSx}
    >
      <Box className="collageBackdropHost" ref={measureRef}>
        <CollageBackdrop backdrop={ALBUM_DETAIL_BACKDROP} />
        <PaperCard
          className="music__wellCard"
          edge="soft-a"
          innerClassName="music__wellInner"
          tiltDeg={-0.7}
          tone={tone}
        >
          {well}
        </PaperCard>
      </Box>
    </Box>
  );
}
