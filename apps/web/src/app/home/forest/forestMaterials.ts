import { createBouncyTransition } from '@dg/ui/helpers/bouncyTransition';
import type { SxObject } from '@dg/ui/theme';
import { LANDMARK_CONTENT_WIDTH_PX, LANDMARK_MAX_HEIGHT_PX } from './forestMap';

export const FOREST_ABOUT_IMAGE_PX = 960;
export const LANDMARK_POST_HEIGHT = 32;
const FRAME_PADDING = 6;

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
    flexShrink: 0,
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
  '& [data-role="content-card-overlay"]': {
    display: 'none',
  },
};

export const boardMediaSx: SxObject = {
  '& .MuiCard-root': { aspectRatio: '2 / 1' },
};

export const landmarkFrameSx: SxObject = {
  backgroundColor: 'var(--forest-wood)',
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent 0 13px, var(--forest-wood-dark) 13px 14px), linear-gradient(180deg, var(--forest-wood-light) 0 4px, transparent 18px)',
  borderRadius: '6px',
  boxShadow: '0 10px 18px -12px var(--forest-shadow)',
  display: 'flex',
  flexDirection: 'column',
  gap: `${FRAME_PADDING}px`,
  maxWidth: LANDMARK_CONTENT_WIDTH_PX + FRAME_PADDING * 2,
  overflow: 'visible',
  padding: `${FRAME_PADDING}px`,
  paddingTop: `${FRAME_PADDING + 10}px`,
  position: 'relative',
  zIndex: 2,
};

export const landmarkSurfaceSx: SxObject = {
  ...dissolveInnerCardSx,
  '& img': {
    borderRadius: 0,
    filter: 'none',
    imageRendering: 'auto',
  },
  '&::-webkit-scrollbar': { width: 8 },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--forest-wood)',
    border: '2px solid var(--forest-paper)',
    borderRadius: 999,
  },
  '&::-webkit-scrollbar-track': { backgroundColor: 'var(--forest-paper-edge)', borderRadius: 999 },
  backgroundBlendMode: 'multiply',
  backgroundColor: 'var(--forest-paper)',
  backgroundImage:
    'radial-gradient(ellipse at 18% 12%, var(--forest-paper-edge) 0 18%, transparent 42%)',
  border: 'none',
  borderRadius: '4px',
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

export const carvedSignSx: SxObject = {
  backgroundColor: 'var(--forest-wood-dark)',
  borderRadius: '4px',
  boxShadow: 'inset 0 1px 0 var(--forest-wood-light), inset 0 -2px 3px rgb(0 0 0 / 0.2)',
  color: 'light-dark(hsl(40deg 60% 94%), hsl(40deg 40% 86%))',
  paddingBlock: 0.5,
  paddingInline: 1.25,
  textAlign: 'center',
};

export const carvedSignLabelSx: SxObject = {
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
};

export const hudSurfaceSx: SxObject = {
  backgroundColor: 'var(--forest-hud)',
  border: '1px solid var(--forest-hud-edge)',
  borderRadius: '10px',
  boxShadow: '0 8px 18px -12px var(--forest-shadow)',
};

export const landmarkNearSx: SxObject = {
  boxShadow: '0 0 0 2px var(--forest-lantern), inset 0 1px 0 var(--forest-wood-light)',
};

export { createBouncyTransition };
