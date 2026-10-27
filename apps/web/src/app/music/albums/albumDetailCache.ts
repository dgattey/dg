import type { AlbumDetail } from '@dg/services/spotify/albumDetailTypes';
import { loadAlbumDetail } from '../../../services/albumDetail.actions';

const albumDetails = new Map<string, Promise<AlbumDetail | null | undefined>>();
const failedAlbumIds = new Set<string>();

/**
 * One request per album for the page's lifetime, shared by every page that links to an
 * album so a detail fetched on hover is ready when the albums page opens it. Selecting an
 * album happens in a transition that suspends on this, so the grid keeps its current layout
 * until the well can open at its final height. A failed load stays failed until the visitor
 * asks for that album again, so rendering the failure never refetches in a loop.
 */
export function albumDetailFor(albumId: string, { retryFailed = false } = {}) {
  if (retryFailed && failedAlbumIds.delete(albumId)) {
    albumDetails.delete(albumId);
  }
  let detail = albumDetails.get(albumId);
  if (!detail) {
    detail = loadAlbumDetail(albumId).catch(() => {
      failedAlbumIds.add(albumId);
      return undefined;
    });
    albumDetails.set(albumId, detail);
  }
  return detail;
}

/** Whether a request for this album has already started, failed ones included. */
export function hasAlbumDetail(albumId: string) {
  return albumDetails.has(albumId);
}
