import type { SxObject } from '../../theme';

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
 * Chrome that has to stay pinned across a sheet navigation needs a
 * view-transition-name, but a named element is also a backdrop root: any
 * `backdrop-filter` inside it samples that element instead of the page, so
 * glass surfaces in the header flatten out to a plain tint. The name is only
 * read while a transition is capturing, so it is claimed only then and the
 * glass keeps the page as its backdrop the rest of the time.
 *
 * The selector leads with `html` rather than `:root`, which Emotion would read
 * as a pseudo-class on this element and never match.
 */
export function pinnedChromeSx(name: string): SxObject {
  return {
    'html:active-view-transition &': {
      viewTransitionName: name,
    },
  };
}

/**
 * Shared between the sheet's heading and the one control allowed to morph into
 * it, so the browser interpolates a single element instead of cross-fading two
 * unrelated snapshots. Exactly one element may carry it at any capture; a
 * duplicate aborts the transition outright.
 */
export const SHEET_TITLE_VIEW_TRANSITION_NAME = 'sheet-title';

/**
 * Held by the control the heading flew out of, for as long as the heading is
 * away. A control with no name of its own stays part of the footer snapshot,
 * which then paints its label in the slot the heading just left, so the
 * heading reads as two texts stacked at the start of the flight.
 */
export const SHEET_TITLE_SLOT_VIEW_TRANSITION_NAME = 'sheet-title-slot';

/**
 * Name for the single control that morphs into the sheet heading. While any
 * sheet that shares that control is open, the control holds the slot name so
 * the heading alone owns `sheet-title` at capture time.
 */
export function sheetTitleMorphName(sheetIsOpen: boolean): string {
  return sheetIsOpen ? SHEET_TITLE_SLOT_VIEW_TRANSITION_NAME : SHEET_TITLE_VIEW_TRANSITION_NAME;
}

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
