import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { LANDMARK_CONTENT_WIDTH_PX, LANDMARK_MAX_HEIGHT_PX } from './forestMap';

/**
 * The world's material vocabulary.
 *
 * Everything the redesign puts on the island is built from four materials —
 * wood, paper, stone and HUD chrome — defined once here as `var(--forest-*)`
 * tokens (see `forestPalette.ts`) and composed into a handful of shared
 * primitives. There is deliberately no per-card styling: a project board, the
 * intro letter and the now-playing grove all frame themselves from these, which
 * is what makes them read as one place instead of a pile of cards.
 *
 * ## Extending to the rest of the site
 *
 * These primitives are page-agnostic on purpose. When `/music` and
 * `/music/albums` adopt the world later, they should import the same tokens and
 * frames rather than inventing new ones:
 *
 * - `landmarkFrameSx` — the carved board any content sits on. An album tile or a
 *   track row becomes a plank on the same board.
 * - `carvedSignSx` — the routed nameplate. Reuse for section titles and the
 *   "back to the island" signpost that would link the pages together.
 * - `hudSurfaceSx` — pinned chrome (header capsule, minimap, hints). A music
 *   page's now-playing bar or filter controls would use the same HUD material.
 * - `dissolveInnerCardSx` — lets an existing `ContentCard` sit on the board
 *   without its own paper, so shared card components can be dropped onto the
 *   world unchanged.
 *
 * Keeping the list this short is the point: only primitives the homepage needs
 * now live here, and each is written so another page can reuse it verbatim.
 */

/** Frame thickness and nameplate sizing, shared so posts and glow line up. */
export const LANDMARK_POST_HEIGHT = 20;
const FRAME_PADDING = 6;

/**
 * Strips a nested `ContentCard`'s own surface so it reads as content resting on
 * the board rather than a card floating on it. Images keep their radius; the
 * card's hover-scale and its glass title overlay give way to the board's own
 * lantern-lit "near" state and carved nameplate, so nothing is announced twice.
 */
export const dissolveInnerCardSx: SxObject = {
  '& .MuiCard-root': {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    boxShadow: 'none',
    // A ContentCard sizes itself to a grid cell it is no longer in. Left alone it
    // stays that width and spills its text past the edge of the board, so the
    // board's own clamp has to win.
    height: 'auto',
    maxWidth: '100%',
    width: '100%',
  },
  '& .MuiCard-root:focus-within, & .MuiCard-root:hover': {
    boxShadow: 'none',
    transform: 'none',
  },
  // The card's own glass title chip; the nameplate carries the name in-world.
  '& [data-role="content-card-overlay"]': {
    display: 'none',
  },
};

/**
 * Gives a card its own shape when it used to take one from the grid.
 *
 * The map is the one card with no intrinsic height: in the grid it fills a row
 * it was assigned, and only below `md` does it fall back to an aspect ratio. A
 * board is a fixed-width box at every viewport, so from `md` up the map card
 * collapsed to about thirty pixels and the board stood there empty. Boards do
 * not vary with viewport width, so neither should this.
 */
export const boardMediaSx: SxObject = {
  '& .MuiCard-root': { aspectRatio: '2 / 1' },
};

/**
 * The carved board a landmark's content is mounted on: a wood frame around a
 * paper surface, with a hard drop shadow so it sits *on* the clearing. Opaque by
 * design — no blur, no translucency — which is what separates it from the old
 * pasted-on glass.
 */
export const landmarkFrameSx: SxObject = {
  backgroundColor: 'var(--forest-wood)',
  borderRadius: '10px',
  boxShadow:
    '0 2px 0 var(--forest-wood-dark), 0 14px 22px -10px light-dark(hsl(140deg 30% 20% / 0.5), hsl(190deg 60% 3% / 0.7))',
  display: 'flex',
  flexDirection: 'column',
  gap: `${FRAME_PADDING}px`,
  maxWidth: LANDMARK_CONTENT_WIDTH_PX + FRAME_PADDING * 2,
  padding: `${FRAME_PADDING}px`,
};

/** The paper inside the frame that content rests on. */
export const landmarkSurfaceSx: SxObject = {
  ...dissolveInnerCardSx,
  backgroundColor: 'var(--forest-paper)',
  border: '1px solid var(--forest-paper-edge)',
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: LANDMARK_MAX_HEIGHT_PX,
  overflow: 'auto',
  overscrollBehavior: 'contain',
  padding: 1,
  // Keep a scrollable long list (side projects, a live tracklist) inside its
  // footprint instead of letting it grow into a neighbour.
  width: LANDMARK_CONTENT_WIDTH_PX,
};

/**
 * The now-playing grove: a rounded stone stage instead of a rectangular board,
 * with overflow left visible so the album's ambient glow can bloom past it and
 * light the surrounding trees.
 */
export const groveStageSx: SxObject = {
  background:
    'radial-gradient(circle at 50% 30%, var(--forest-stone-light), var(--forest-stone) 72%)',
  borderRadius: '999px 999px 20px 20px',
  boxShadow:
    '0 2px 0 var(--forest-wood-dark), 0 18px 30px -12px light-dark(hsl(140deg 30% 20% / 0.5), hsl(190deg 60% 3% / 0.75))',
  display: 'flex',
  flexDirection: 'column',
  gap: `${FRAME_PADDING}px`,
  maxWidth: LANDMARK_CONTENT_WIDTH_PX + FRAME_PADDING * 4,
  overflow: 'visible',
  padding: `${FRAME_PADDING * 2}px`,
};

/**
 * Grove surface keeps overflow visible so the ambient album glow spills out. It
 * pins a fixed height rather than a max so the now-playing card fills the stage
 * and the glow escapes past it without the content growing the footprint.
 */
export const groveSurfaceSx: SxObject = {
  ...dissolveInnerCardSx,
  display: 'flex',
  flexDirection: 'column',
  height: LANDMARK_MAX_HEIGHT_PX,
  overflow: 'visible',
  width: LANDMARK_CONTENT_WIDTH_PX,
};

/** The routed nameplate that names each stop, carved into a darker wood plate. */
export const carvedSignSx: SxObject = {
  backgroundColor: 'var(--forest-wood-dark)',
  borderRadius: '4px',
  boxShadow: 'inset 0 1px 0 var(--forest-wood-light), inset 0 -2px 3px rgb(0 0 0 / 0.25)',
  color: 'light-dark(hsl(40deg 60% 92%), hsl(40deg 44% 84%))',
  paddingBlock: 0.5,
  paddingInline: 1.25,
  textAlign: 'center',
};

export const carvedSignLabelSx: SxObject = {
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

/**
 * Pinned HUD chrome — the minimap, the walk hint, and (via a global style) the
 * header capsule. Nearly opaque wood-and-paper so it reads as a signpost bolted
 * to the world rather than the frosted glass it replaces.
 */
export const hudSurfaceSx: SxObject = {
  backgroundColor: 'var(--forest-hud)',
  border: '1px solid var(--forest-hud-edge)',
  borderRadius: '12px',
  boxShadow: '0 8px 20px -10px light-dark(hsl(140deg 30% 20% / 0.5), hsl(190deg 60% 3% / 0.7))',
};

/** Emphasis applied to whichever board the walker is standing at. */
export const landmarkNearSx: SxObject = {
  boxShadow:
    '0 0 0 2px var(--forest-lantern), 0 2px 0 var(--forest-wood-dark), 0 18px 30px -10px light-dark(hsl(38deg 90% 40% / 0.45), hsl(30deg 90% 30% / 0.55))',
};

export { createBouncyTransition };
