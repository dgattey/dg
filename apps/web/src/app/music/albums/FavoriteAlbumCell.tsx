import { albumRoute, favoriteAlbumsRoute } from '@dg/shared-core/routes/app';
import {
  albumArtViewTransitionName,
  albumTransitionTypes,
} from '@dg/ui/core/transitions/pageTransitions';
import { Link } from '@dg/ui/dependent/Link';
import { ViewTransition } from 'react';
import { AlbumCover } from '../AlbumCover';
import { AlbumStack } from '../AlbumStack';
import { MAX_ALBUM_SLEEVES } from '../albumTileGeometry';
import { type CollageAlbumCardTreatment, CollageAlbumPaper } from './collageAlbumCardTreatments';

/** Every favorite is a whole album, so every cell wears the full fan. */
const SLEEVE_COUNT = MAX_ALBUM_SLEEVES;

type Props = {
  albumId: string;
  albumName: string;
  artistCaption: string;
  collageTreatment: CollageAlbumCardTreatment;
  imageUrl: string;
  /** When true, keep the cell size but hide art (it lives in the well). */
  collapsed?: boolean;
  /** Loads the covers eagerly at high priority. */
  isLcpCandidate?: boolean;
};

function AlbumArtCover({
  albumId,
  albumName,
  collapsed,
  imageUrl,
  isLcpCandidate = false,
}: {
  albumId: string;
  albumName: string;
  collapsed: boolean;
  imageUrl: string;
  isLcpCandidate?: boolean;
}) {
  if (collapsed) {
    return (
      <AlbumCover
        alt=""
        depth={0}
        imageUrl={imageUrl}
        isLcpCandidate={isLcpCandidate}
        sleeveCount={SLEEVE_COUNT}
      />
    );
  }
  return (
    // `default="none"` keeps this name off page-open/close. Without it
    // every cover enters during homepage → albums, and React snapshots
    // the whole grid as separate shared elements mid-flight.
    <ViewTransition default="none" name={albumArtViewTransitionName(albumId)} share="vt-album-art">
      <AlbumCover
        alt={albumName}
        depth={0}
        imageUrl={imageUrl}
        isLcpCandidate={isLcpCandidate}
        sleeveCount={SLEEVE_COUNT}
      />
    </ViewTransition>
  );
}

/**
 * Favorite-albums grid cell. Opens the in-page album well via a typed view
 * transition; the front cover shares a VT name with the well so it morphs on
 * open and close, while the sleeves it fans stay out of the flight entirely.
 */
export function FavoriteAlbumCell({
  albumId,
  albumName,
  artistCaption,
  collageTreatment,
  imageUrl,
  collapsed = false,
  isLcpCandidate = false,
}: Props) {
  const href = collapsed ? favoriteAlbumsRoute : albumRoute(albumId);
  return (
    <CollageAlbumPaper selected={collapsed} treatment={collageTreatment}>
      <Link
        className="music__albumLink"
        href={href}
        title={collapsed ? `Close ${albumName}` : undefined}
        transitionTypes={albumTransitionTypes(collapsed ? 'close' : 'open')}
      >
        <span className="music__art music__fullColorArt">
          <AlbumStack
            imageUrl={imageUrl}
            isLcpCandidate={isLcpCandidate}
            sleeveCount={SLEEVE_COUNT}
          >
            <AlbumArtCover
              albumId={albumId}
              albumName={albumName}
              collapsed={collapsed}
              imageUrl={imageUrl}
              isLcpCandidate={isLcpCandidate}
            />
            {collapsed ? (
              <i aria-hidden="true" className="music__closeMark">
                ×
              </i>
            ) : null}
          </AlbumStack>
        </span>
        <span className="music__caption">
          <strong className="music__albumName">{albumName}</strong>
          <span className="music__artist">{artistCaption}</span>
        </span>
      </Link>
    </CollageAlbumPaper>
  );
}
