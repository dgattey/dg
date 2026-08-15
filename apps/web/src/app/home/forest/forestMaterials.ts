import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { LANDMARK_CONTENT_WIDTH_PX, LANDMARK_MAX_HEIGHT_PX } from './forestMap';

/**
 * The world's material vocabulary.
 *
 * Everything the redesign puts on the island is built from four materials —
 * weathered crate, paper, slag-stone and steel HUD — defined once here as
 * `var(--forest-*)` tokens (see `forestPalette.ts`) and composed into a handful
 * of shared primitives. There is deliberately no per-card styling: a project
 * board, the intro letter and the now-playing grove all frame themselves from
 * these, which is what makes them read as one place instead of a pile of cards.
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

/** Intrinsic size requested for the forest About photo so a 1440 crop stays sharp. */
export const FOREST_ABOUT_IMAGE_PX = 960;

/** Posts that plant the plaque in the dirt. Short, so they read as feet, not stilts. */
export const LANDMARK_POST_HEIGHT = 32;
const FRAME_PADDING = 6;

/**
 * Strips a nested `ContentCard`'s own surface so it reads as content resting on
 * the board rather than a card floating on it. Theme Card chrome — border,
 * radius, paper fill, hover scale, glass title — has to lose, or the plaque
 * still looks like a homepage tile.
 */
export const dissolveInnerCardSx: SxObject = {
  '& .MuiCard-root img, & img': {
    borderRadius: 0,
  },
  '& .MuiCard-root, & .MuiPaper-root': {
    backgroundColor: 'transparent',
    backgroundImage: 'none',
    border: 'none',
    borderColor: 'transparent',
    borderRadius: 0,
    borderStyle: 'none',
    borderWidth: 0,
    boxShadow: 'none',
    // As a flex item the card was shrinking below its content and clipping the
    // rest itself, because a Card is `overflow: hidden`. That hid the last two
    // lines of the intro letter mid-sentence and left nothing to scroll: the
    // board's surface never saw the overflow. Keep the card its natural height
    // and let it spill into the surface, which is the thing that scrolls.
    flexShrink: 0,
    // A ContentCard sizes itself to a grid cell it is no longer in. Left alone it
    // stays that width and spills its text past the edge of the board, so the
    // board's own clamp has to win.
    height: 'auto',
    maxWidth: '100%',
    outline: 'none',
    overflow: 'visible',
    width: '100%',
  },
  '& .MuiCard-root:focus-within, & .MuiCard-root:hover': {
    border: 'none',
    boxShadow: 'none',
    outline: 'none',
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
 * Photographs as a print on the board: warm paper, no mosaic, no
 * `pixelated` rendering. The source asset is untouched.
 */
export const PIXELATE_CONTRAST = 1;
export const PIXELATE_SATURATE = 1;

export const pixelatedMediaSx: SxObject = {
  '& img': {
    borderRadius: 0,
    filter: 'none',
    imageRendering: 'auto',
  },
};

/**
 * The carved board a landmark's content is mounted on: a wood frame around a
 * paper surface. It sits on posts; the ground shadow lives on the landmark, not
 * as a Material drop shadow that would float the board over the map.
 */
export const landmarkFrameSx: SxObject = {
  backgroundColor: 'var(--forest-wood)',
  backgroundImage:
    'linear-gradient(90deg, var(--forest-wood-light) 0 3px, transparent 3px), linear-gradient(180deg, var(--forest-wood-light) 0 2px, transparent 10px)',
  border: '1px solid var(--forest-steel)',
  borderRadius: '1px',
  boxShadow:
    'inset 0 0 0 1px var(--forest-wood-dark), 1px 1px 0 var(--forest-bark-dark), 2px 2px 0 rgb(0 0 0 / 0.28)',
  display: 'flex',
  flexDirection: 'column',
  gap: `${FRAME_PADDING}px`,
  maxWidth: LANDMARK_CONTENT_WIDTH_PX + FRAME_PADDING * 2,
  overflow: 'visible',
  padding: `${FRAME_PADDING}px`,
  paddingTop: `${FRAME_PADDING + 10}px`,
  position: 'relative',
  // Dirt and shadow sit later in the stack and used to paint over the
  // overflowing photograph. Keep the paper above those feet.
  zIndex: 2,
};

/**
 * The paper inside the frame that content rests on.
 *
 * A long card — the intro letter, a side-project list — is clamped to the
 * board's footprint and scrolls inside it, which left it sliced through the
 * middle of a line with nothing to say it continued: macOS hides the overlay
 * scrollbar until you are already scrolling, so there was no way to know. The
 * board therefore carries its own always-visible scrollbar, cut from the same
 * wood as the frame, and only on the boards that actually overflow.
 */
export const landmarkSurfaceSx: SxObject = {
  ...dissolveInnerCardSx,
  ...pixelatedMediaSx,
  '&::-webkit-scrollbar': { width: 8 },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--forest-steel)',
    border: '1px solid var(--forest-paper)',
    borderRadius: 1,
  },
  '&::-webkit-scrollbar-track': { backgroundColor: 'var(--forest-paper-edge)', borderRadius: 1 },
  backgroundBlendMode: 'multiply',
  backgroundColor: 'var(--forest-paper)',
  backgroundImage:
    'linear-gradient(180deg, var(--forest-paper-edge) 0 1px, transparent 12px), linear-gradient(90deg, rgb(0 0 0 / 0.04) 0 1px, transparent 1px)',
  border: '1px solid var(--forest-paper-edge)',
  borderRadius: '1px',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: LANDMARK_MAX_HEIGHT_PX,
  overflow: 'auto',
  overscrollBehavior: 'contain',
  padding: 1,
  scrollbarColor: 'var(--forest-wood) var(--forest-paper-edge)',
  scrollbarWidth: 'thin',
  width: LANDMARK_CONTENT_WIDTH_PX,
};

/**
 * The now-playing grove: a rounded stone stage instead of a rectangular board,
 * with overflow left visible so the album's ambient glow can bloom past it and
 * light the surrounding trees.
 */
export const groveStageSx: SxObject = {
  background:
    'linear-gradient(180deg, var(--forest-stone-light) 0 3px, var(--forest-stone) 18px, var(--forest-rock) 100%)',
  border: '1px solid var(--forest-steel)',
  borderRadius: '1px',
  boxShadow: '1px 1px 0 var(--forest-bark-dark), 2px 2px 0 rgb(0 0 0 / 0.28)',
  display: 'flex',
  flexDirection: 'column',
  gap: `${FRAME_PADDING}px`,
  maxWidth: LANDMARK_CONTENT_WIDTH_PX + FRAME_PADDING * 4,
  overflow: 'visible',
  padding: `${FRAME_PADDING * 2}px`,
  position: 'relative',
  zIndex: 2,
};

/**
 * Grove surface keeps overflow visible so the ambient album glow spills out. It
 * pins a fixed height rather than a max so the now-playing card fills the stage
 * and the glow escapes past it without the content growing the footprint.
 */
export const groveSurfaceSx: SxObject = {
  ...dissolveInnerCardSx,
  ...pixelatedMediaSx,
  display: 'flex',
  flexDirection: 'column',
  height: LANDMARK_MAX_HEIGHT_PX,
  overflow: 'visible',
  width: LANDMARK_CONTENT_WIDTH_PX,
};

/** The stenciled nameplate that names each stop, a steel-edged crate plate. */
export const carvedSignSx: SxObject = {
  backgroundColor: 'var(--forest-wood-dark)',
  backgroundImage:
    'radial-gradient(circle at 8px 50%, var(--forest-steel) 0 1.4px, transparent 1.6px), radial-gradient(circle at calc(100% - 8px) 50%, var(--forest-steel) 0 1.4px, transparent 1.6px)',
  border: '1px solid var(--forest-steel)',
  borderRadius: '1px',
  boxShadow: 'inset 0 1px 0 var(--forest-wood-light), inset 0 -1px 0 rgb(0 0 0 / 0.35)',
  color: 'light-dark(hsl(40deg 12% 86%), hsl(40deg 8% 78%))',
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
 * header capsule. A steel-edged panel, not a cream pill.
 */
export const hudSurfaceSx: SxObject = {
  backgroundColor: 'var(--forest-hud)',
  border: '1px solid var(--forest-hud-edge)',
  borderRadius: '2px',
  boxShadow: '1px 1px 0 rgb(0 0 0 / 0.28), 2px 2px 0 rgb(0 0 0 / 0.12)',
};

/** Emphasis applied to whichever board the walker is standing at. */
export const landmarkNearSx: SxObject = {
  boxShadow: '0 0 0 1px var(--forest-brass), 1px 1px 0 var(--forest-bark-dark)',
};

export { createBouncyTransition };
