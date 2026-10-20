import { CollageAlbumSkeletonGrid, CollageSortSkeleton } from './collageAlbumCardTreatments';

const DEFAULT_PLACEHOLDER_COUNT = 12;

export function FavoriteAlbumsSkeleton({
  tileCount = DEFAULT_PLACEHOLDER_COUNT,
}: {
  tileCount?: number;
} = {}) {
  return (
    <>
      <CollageSortSkeleton />
      <CollageAlbumSkeletonGrid tileCount={tileCount} />
    </>
  );
}
