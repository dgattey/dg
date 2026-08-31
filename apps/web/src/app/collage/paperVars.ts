import type { CSSProperties } from 'react';
import { PAPER_INK_TONES, type PaperEdge, type PaperTone } from './types';

type CssVars = CSSProperties & Record<`--${string}`, string | number>;

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ');
}

export function paperToneVars(tone: PaperTone, tiltDeg = 0): CssVars {
  return {
    '--on': tone in PAPER_INK_TONES ? 'var(--ink-on-cream)' : 'var(--cream)',
    '--pc': `var(--${tone})`,
    '--r': `${tiltDeg}deg`,
  };
}

export function paperEdgeVars(edge: PaperEdge): CssVars {
  return {
    '--clip': `var(--${edge})`,
  };
}

export function paperSurfaceVars(tone: PaperTone, edge: PaperEdge, tiltDeg = 0): CssVars {
  return {
    ...paperToneVars(tone, tiltDeg),
    ...paperEdgeVars(edge),
  };
}
