type PageNavigationIntent = 'open' | 'close';

const PAGE_TRANSITION_TYPES = {
  close: 'page-close',
  open: 'page-open',
} as const;

const ALBUM_TRANSITION_TYPES = {
  close: 'album-close',
  open: 'album-open',
} as const;

type PageTransitionType = (typeof PAGE_TRANSITION_TYPES)[PageNavigationIntent];
type AlbumTransitionType = (typeof ALBUM_TRANSITION_TYPES)[PageNavigationIntent];

export function pageTransitionTypes(intent: PageNavigationIntent): Array<PageTransitionType> {
  return [PAGE_TRANSITION_TYPES[intent]];
}

/**
 * Album well open/close intentionally miss the page rise/fall map so the grid
 * stays put and only the shared album-art name morphs between cell and well.
 */
export function albumTransitionTypes(intent: PageNavigationIntent): Array<AlbumTransitionType> {
  return [ALBUM_TRANSITION_TYPES[intent]];
}

/** Shared element name so album art flies between the grid cell and the well. */
export function albumArtViewTransitionName(albumId: string): string {
  return `album-art-${albumId}`;
}

/**
 * One boundary owns page content, and the intent of the navigation decides
 * whether the arriving route rises over the page it came from or that page
 * comes back out from under it. Classes are matched in `pageTransitions.css`.
 *
 * React only snapshots elements inside a ViewTransition boundary. Without this
 * the outgoing page is simply gone on the first animation frame: `root` has no
 * old snapshot, so no CSS on `::view-transition-old(root)` can help.
 *
 * Untyped App Router navigations get no motion. React skips ViewTransition on
 * popstate/back for bfcache, so browser-chrome back still snaps; use the logo
 * for an animated return home.
 */
export const pageViewTransitionProps = {
  default: 'none' as const,
  enter: {
    [PAGE_TRANSITION_TYPES.close]: 'vt-page-reveal',
    [PAGE_TRANSITION_TYPES.open]: 'vt-page-rise',
    default: 'none',
  },
  exit: {
    [PAGE_TRANSITION_TYPES.close]: 'vt-page-fall',
    [PAGE_TRANSITION_TYPES.open]: 'vt-page-recede',
    default: 'none',
  },
} as const;
