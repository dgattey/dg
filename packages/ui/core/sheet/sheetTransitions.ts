export type SheetNavigationIntent = 'open' | 'close';

export const SHEET_TRANSITIONS = {
  close: {
    pageViewTransitionClass: 'vt-page-advance',
    transitionType: 'sheet-close',
    viewTransitionClass: 'vt-sheet-close',
  },
  open: {
    pageViewTransitionClass: 'vt-page-recede',
    transitionType: 'sheet-open',
    viewTransitionClass: 'vt-sheet-open',
  },
} as const;

export type SheetTransitionType =
  (typeof SHEET_TRANSITIONS)[SheetNavigationIntent]['transitionType'];

export function sheetTransitionTypes(intent: SheetNavigationIntent): Array<SheetTransitionType> {
  return [SHEET_TRANSITIONS[intent].transitionType];
}

export const SITE_HEADER_VIEW_TRANSITION_NAME = 'site-header';
export const SITE_FOOTER_VIEW_TRANSITION_NAME = 'site-footer';

/**
 * Shared between the sheet's heading and whichever control opened the sheet,
 * so the browser interpolates one into the other instead of cross-fading two
 * unrelated snapshots. A page can hold several sheet entry points, so the
 * name is applied to a single control at click time by `SheetOpenLink`.
 */
export const SHEET_TITLE_VIEW_TRANSITION_NAME = 'sheet-title';

/**
 * Typed Link navigations map to open/close classes. Untyped App Router
 * transitions (no transitionTypes) use the structural default. React skips
 * ViewTransition on popstate/back for bfcache, so browser-chrome back still
 * snaps; use the sheet Close link for animated dismiss.
 */
export const sheetViewTransitionProps = {
  default: 'none' as const,
  enter: {
    [SHEET_TRANSITIONS.close.transitionType]: 'none',
    [SHEET_TRANSITIONS.open.transitionType]: SHEET_TRANSITIONS.open.viewTransitionClass,
    default: SHEET_TRANSITIONS.open.viewTransitionClass,
  },
  exit: {
    [SHEET_TRANSITIONS.close.transitionType]: SHEET_TRANSITIONS.close.viewTransitionClass,
    [SHEET_TRANSITIONS.open.transitionType]: 'none',
    default: SHEET_TRANSITIONS.close.viewTransitionClass,
  },
} as const;

/**
 * Page content boundary, applied per route so React sees an exit and an enter
 * rather than one element morphing between two very different heights.
 *
 * React only snapshots elements inside a ViewTransition boundary. Without this
 * the outgoing page is simply gone on the first animation frame: `root` has no
 * old snapshot to fade, so no CSS on `::view-transition-old(root)` can help.
 */
export const sheetPageViewTransitionProps = {
  default: 'none' as const,
  enter: {
    [SHEET_TRANSITIONS.close.transitionType]: SHEET_TRANSITIONS.close.pageViewTransitionClass,
    [SHEET_TRANSITIONS.open.transitionType]: 'none',
    default: 'none',
  },
  exit: {
    [SHEET_TRANSITIONS.close.transitionType]: 'none',
    [SHEET_TRANSITIONS.open.transitionType]: SHEET_TRANSITIONS.open.pageViewTransitionClass,
    default: 'none',
  },
} as const;
