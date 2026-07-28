export type SheetNavigationIntent = 'open' | 'close';

export const SHEET_TRANSITIONS = {
  close: {
    transitionType: 'sheet-close',
    viewTransitionClass: 'vt-sheet-close',
  },
  open: {
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
