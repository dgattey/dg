import type { CSSProperties } from 'react';
import { PAPER_INK_TONES, type PaperEdge, type PaperTone, TORN_PAPER_EDGES } from './types';

type CssVars = CSSProperties & Record<`--${string}`, string | number>;

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ');
}

export function paperToneVars(tone: PaperTone, tiltDeg = 0): CssVars {
  const on =
    tone === 'leaf'
      ? 'light-dark(var(--cream), var(--ink-on-cream))'
      : tone in PAPER_INK_TONES
        ? 'var(--ink-on-cream)'
        : 'var(--cream)';
  return {
    '--on': on,
    '--pc': `var(--${tone})`,
    '--r': `${tiltDeg}deg`,
  };
}

const CORNERS = ['tl', 'tr', 'br', 'bl'] as const;

/**
 * Torn edges clip to their polygon. Rounded edges set each corner's radius, which
 * nested panels and outer rims offset by their gap to stay concentric with the paper.
 * Every variable is set either way, since paper nested in other paper inherits them.
 */
function paperEdgeVars(edge: PaperEdge): CssVars {
  const torn = edge in TORN_PAPER_EDGES;
  const vars: CssVars = {
    '--clip': torn ? `var(--${edge})` : 'none',
    '--edge-radius': torn ? '0px' : `var(--${edge})`,
  };
  for (const corner of CORNERS) {
    vars[`--edge-${corner}`] = torn ? '0px' : `var(--${edge}-${corner})`;
  }
  return vars;
}

export function paperSurfaceVars(tone: PaperTone, edge: PaperEdge, tiltDeg = 0): CssVars {
  return {
    ...paperToneVars(tone, tiltDeg),
    ...paperEdgeVars(edge),
  };
}
