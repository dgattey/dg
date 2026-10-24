import { Image } from '@dg/ui/dependent/Image';
import {
  ALBUM_TILE_ART_SIZE,
  ALBUM_TILE_ART_SIZES,
  albumCoverStyle,
  albumSleeveScrimStyle,
} from './albumTileGeometry';

type Props = {
  /** Album art URL, the same for every cover in a stack. */
  imageUrl: string;
  /** Empty for the sleeves behind the front cover, which are decorative. */
  alt: string;
  /** 0 is the front cover; deeper covers sit further back in the fan. */
  depth: number;
  /** Sleeves behind the front cover, which is what centres the fan. */
  sleeveCount: number;
  /** Loads eagerly at high priority, for the cover that paints as the page's LCP. */
  isLcpCandidate?: boolean;
};

/**
 * One album cover, the piece every music grid cell is built from. Covers
 * behind the front carry a scrim of page background so the fan recedes.
 */
export function AlbumCover({ imageUrl, alt, depth, sleeveCount, isLcpCandidate = false }: Props) {
  const isEagerFrontCover = isLcpCandidate && depth === 0;
  return (
    <div
      aria-hidden={depth > 0 || undefined}
      className={depth === 0 ? 'music__cover music__cover--front' : 'music__cover'}
      style={albumCoverStyle(depth, sleeveCount)}
    >
      <Image
        alt={alt}
        fetchPriority={isEagerFrontCover ? 'high' : undefined}
        fill={true}
        height={ALBUM_TILE_ART_SIZE}
        loading={isEagerFrontCover ? 'eager' : undefined}
        sizes={ALBUM_TILE_ART_SIZES}
        url={imageUrl}
        width={ALBUM_TILE_ART_SIZE}
      />
      {depth > 0 ? (
        <span className="music__sleeveScrim" style={albumSleeveScrimStyle(depth)} />
      ) : null}
    </div>
  );
}
