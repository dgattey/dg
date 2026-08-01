export type SheetNavigationIntent = 'open' | 'close';

const SHEET_TRANSITION_TYPES = {
  close: 'sheet-close',
  open: 'sheet-open',
} as const;

export type SheetTransitionType = (typeof SHEET_TRANSITION_TYPES)[SheetNavigationIntent];

export function sheetTransitionTypes(intent: SheetNavigationIntent): Array<SheetTransitionType> {
  return [SHEET_TRANSITION_TYPES[intent]];
}

export const SITE_HEADER_VIEW_TRANSITION_NAME = 'site-header';
export const SITE_FOOTER_VIEW_TRANSITION_NAME = 'site-footer';

/**
 * Shared between the sheet's heading and the one control allowed to morph into
 * it, so the browser interpolates a single element instead of cross-fading two
 * unrelated snapshots. Exactly one element may carry it at any capture; a
 * duplicate aborts the transition outright.
 */
export const SHEET_TITLE_VIEW_TRANSITION_NAME = 'sheet-title';

/**
 * One boundary owns page content, and the intent of the navigation decides
 * whether the arriving route is a sheet rising over the page it covers or the
 * page coming back out from under it. Classes are matched in
 * `sheetTransitions.css`.
 *
 * React only snapshots elements inside a ViewTransition boundary. Without this
 * the outgoing page is simply gone on the first animation frame: `root` has no
 * old snapshot, so no CSS on `::view-transition-old(root)` can help.
 *
 * Untyped App Router navigations get no motion. React skips ViewTransition on
 * popstate/back for bfcache, so browser-chrome back still snaps; use the
 * sheet's Close link for an animated dismiss.
 */
export const sheetPageViewTransitionProps = {
  default: 'none' as const,
  enter: {
    [SHEET_TRANSITION_TYPES.close]: 'vt-page-reveal',
    [SHEET_TRANSITION_TYPES.open]: 'vt-sheet-rise',
    default: 'none',
  },
  exit: {
    [SHEET_TRANSITION_TYPES.close]: 'vt-sheet-fall',
    [SHEET_TRANSITION_TYPES.open]: 'vt-page-recede',
    default: 'none',
  },
} as const;
