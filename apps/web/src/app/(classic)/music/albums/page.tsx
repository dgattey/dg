import 'server-only';

/**
 * The favorite-albums grid and well live in the layout so opening an album
 * swaps only the well's contents without unmounting the grid.
 *
 * Keeping the page synchronous and free of `searchParams` allows `/music/albums`
 * to prerender 100% statically at the CDN edge with no dynamic Suspense hole;
 * `?album=<id>` is read on the client and resolved via the cached `loadAlbumDetail`
 * server action (`cacheLife('hours')`).
 */
export default function FavoriteAlbumsPage() {
  return null;
}
