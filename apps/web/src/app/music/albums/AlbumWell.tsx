import type { PlaylistAlbum } from '@dg/content-models/spotify/PlaylistAlbums';
import { albumArtViewTransitionName } from '@dg/ui/core/transitions/pageTransitions';
import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import type { ReactNode } from 'react';
import { ViewTransition } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import type { PaperTone } from '../../collage/types';

const WELL_ART_SIZE = 220;

/** The well art is 220px through its 820px stack and up to 300px beside the tracklist. */
const COLLAGE_WELL_ART_SIZES = { extraLarge: 300, large: 300, medium: 300, small: 220, tiny: 220 };

type Props = {
  /** Header data the grid already holds. */
  album: PlaylistAlbum;
  /** Fetched detail: artist links, meta, and the tracklist. */
  children?: ReactNode;
  /** The paper of the card that opened this well, so the two read as one. */
  tone?: PaperTone;
};

/**
 * Expanded album well. The grid only mounts it once the detail has loaded, so it
 * opens at its final height in one commit: the `album-well` view transition wipes
 * it open, contents still, while the cells below slide the same distance, and
 * nothing inside it resizes afterwards.
 */
export function AlbumWell({ album, children, tone = 'viridian' }: Props) {
  return (
    <PaperCard
      className="music__wellCard"
      edge="soft-a"
      innerClassName="music__wellInner"
      tiltDeg={-0.7}
      tone={tone}
    >
      <section aria-label={`${album.name} details`} className="music__wellShell">
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
            <div className="music__wellArtFrame">
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
              <PaperTag
                className="collagePin music__wellAlbumTag"
                edge="quad-c"
                tiltDeg={-5}
                tone="ochre"
                variant="meta"
              >
                <span>Album</span>
                <small>{album.releaseDate.slice(0, 4)}</small>
              </PaperTag>
              <PaperTag
                className="collagePin music__wellSpotifyTag"
                edge="quad-c"
                tiltDeg={3}
                tone="cream"
                variant="meta"
              >
                Spotify ↗
              </PaperTag>
            </div>
          </ViewTransition>
        </Link>
        <h2 className="music__wellName" data-typography="display-page">
          <Link href={album.url} isExternal={true} title={album.name}>
            {album.name}
          </Link>
        </h2>
        {children}
      </section>
    </PaperCard>
  );
}
