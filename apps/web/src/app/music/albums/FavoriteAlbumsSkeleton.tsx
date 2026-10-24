import {
  CollageAlbumSkeletonGrid,
  CollageSortControls,
  DEFAULT_ALBUM_SORT,
} from './collageAlbumCardTreatments';

const DEFAULT_PLACEHOLDER_COUNT = 12;

export function FavoriteAlbumsSkeleton({
  tileCount = DEFAULT_PLACEHOLDER_COUNT,
}: {
  tileCount?: number;
} = {}) {
  return (
    <>
      <CollageSortControls sortKey={DEFAULT_ALBUM_SORT} />
      <CollageAlbumSkeletonGrid tileCount={tileCount} />
    </>
  );
}
