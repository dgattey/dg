import type { SxObject } from '../../theme';

export type PageNavigationIntent = 'open' | 'close';

const PAGE_TRANSITION_TYPES = {
  close: 'page-close',
  open: 'page-open',
} as const;

export type PageTransitionType = (typeof PAGE_TRANSITION_TYPES)[PageNavigationIntent];

export function pageTransitionTypes(intent: PageNavigationIntent): Array<PageTransitionType> {
  return [PAGE_TRANSITION_TYPES[intent]];
}

export const SITE_HEADER_VIEW_TRANSITION_NAME = 'site-header';
export const SITE_FOOTER_VIEW_TRANSITION_NAME = 'site-footer';

/**
 * Sticky bar chrome — the window-top mask, the bar fill, and the fade under it —
 * is a full-bleed opaque band, and it gets photographed into whichever snapshot
 * catches it. A navigation then sweeps that band across mid-page content: the
 * row under a bar washes to cream from the top down and reads as blank tiles
 * with a sliver of artwork below.
 *
 * So the chrome just doesn't paint while a transition runs. Both sides read
 * this rule at capture time, so neither page carries a band, and the strip above
 * a pinned bar is briefly unmasked instead — the lesser of the two, and it lands
 * back the instant the flight ends. Hiding beats a group of its own: a name per
 * piece is the only way to lift them out of the page bitmap, and a page with
 * several bars needs a unique one for each, which no widely supported keyword
 * gives us.
 *
 * The selector leads with `html` rather than `:root`, which Emotion would read
 * as a pseudo-class on this element and never match.
 */
export const stickyDecorSx: SxObject = {
  'html:active-view-transition &': {
    opacity: 0,
  },
};

/**
 * Chrome that has to stay pinned across a navigation needs a
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
 * Shared between a destination page's heading and the one control allowed to
 * morph into it, so the browser interpolates a single element instead of
 * cross-fading two unrelated snapshots. Exactly one element may carry it at any
 * capture; a duplicate aborts the transition outright.
 */
export const PAGE_TITLE_VIEW_TRANSITION_NAME = 'page-title';

/**
 * Held by the control the heading flew out of, for as long as the heading is
 * away. A control with no name of its own stays part of the footer snapshot,
 * which then paints its label in the slot the heading just left, so the
 * heading reads as two texts stacked at the start of the flight.
 */
export const PAGE_TITLE_SLOT_VIEW_TRANSITION_NAME = 'page-title-slot';

/**
 * Name for the single control that morphs into a page heading. While a page
 * that shares that control is open, the control holds the slot name so the
 * heading alone owns `page-title` at capture time.
 */
export function pageTitleMorphName(destinationIsOpen: boolean): string {
  return destinationIsOpen ? PAGE_TITLE_SLOT_VIEW_TRANSITION_NAME : PAGE_TITLE_VIEW_TRANSITION_NAME;
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
