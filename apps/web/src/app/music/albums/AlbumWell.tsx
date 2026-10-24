'use client';

import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { albumArtViewTransitionName } from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { CSSProperties, ReactNode, TransitionEvent } from 'react';
import { useLayoutEffect, useRef, useState, ViewTransition } from 'react';
import { ALBUM_DETAIL_BACKDROP } from '../../collage/backdrops';
import { CollageBackdrop } from '../../collage/CollageBackdrop';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import type { PaperTone } from '../../collage/types';

const WELL_ART_SIZE = 220;

/** The well art is 220px through its 820px stack and up to 300px beside the tracklist. */
const COLLAGE_WELL_ART_SIZES = { extraLarge: 300, large: 300, medium: 300, small: 220, tiny: 220 };

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
 * so that swap costs the page no layout at all.
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
        <div className="music__wellArtCard">
          <Image
            alt={album.name}
            fetchPriority="high"
            height={WELL_ART_SIZE}
            preload={true}
            sizes={COLLAGE_WELL_ART_SIZES}
            url={album.imageUrl}
            width={WELL_ART_SIZE}
          />
        </div>
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
    <section
      aria-label={`${album.name} details`}
      className="music__wellShell"
      style={
        reservePx != null ? ({ '--well-reserve-h': `${reservePx}px` } as CSSProperties) : undefined
      }
    >
      {art}
      {title}
      {children}
    </section>
  );

  return (
    <div
      className={
        heightPx != null ? 'music__wellOuter music__wellOuter--locked' : 'music__wellOuter'
      }
      onTransitionEnd={handleTransitionEnd}
      style={
        heightPx != null ? ({ '--well-locked-h': `${heightPx}px` } as CSSProperties) : undefined
      }
    >
      <div className="collageBackdropHost" ref={measureRef}>
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
      </div>
    </div>
  );
}
