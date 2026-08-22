'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { useId } from 'react';

const SPRIG = '#3e5a3a';

const leavesSx: SxObject = {
  '[data-greenhouse-frame] &': {
    opacity: 1,
  },
  inset: 0,
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 3,
};

const bloomsSx: SxObject = {
  '[data-greenhouse-frame] &': {
    backgroundImage:
      'radial-gradient(ellipse 45% 42% at 88% 14%, rgb(231 212 138 / 0.35) 0%, rgb(231 212 138 / 0.16) 42%, transparent 72%), radial-gradient(ellipse 36% 40% at 78% 48%, rgb(138 154 91 / 0.2) 0%, rgb(138 154 91 / 0.08) 48%, transparent 74%), radial-gradient(ellipse 40% 28% at 70% 94%, rgb(244 232 190 / 0.24) 0%, rgb(244 232 190 / 0.08) 46%, transparent 72%)',
    filter: 'blur(44px)',
  },
  inset: 0,
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
};

type Point = { x: number; y: number };

type LeafSpec = {
  x: number;
  y: number;
  rotate: number;
  length: number;
  width: number;
  opacity: number;
};

function bezierPoint(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  const u = 1 - t;
  const uu = u * u;
  const tt = t * t;
  return {
    x: uu * u * a.x + 3 * uu * t * b.x + 3 * u * tt * c.x + tt * t * d.x,
    y: uu * u * a.y + 3 * uu * t * b.y + 3 * u * tt * c.y + tt * t * d.y,
  };
}

function bezierAngle(a: Point, b: Point, c: Point, d: Point, t: number): number {
  const u = 1 - t;
  const dx = 3 * u * u * (b.x - a.x) + 6 * u * t * (c.x - b.x) + 3 * t * t * (d.x - c.x);
  const dy = 3 * u * u * (b.y - a.y) + 6 * u * t * (c.y - b.y) + 3 * t * t * (d.y - c.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

function lanceolate(length: number, width: number): string {
  const tip = length * 0.7;
  const base = length * 0.3;
  const waist = width * 0.38;
  return `M 0 ${-base} C ${width} ${-base * 0.12} ${width * 0.7} ${tip * 0.2} ${waist} ${tip * 0.64} C ${waist * 0.4} ${tip * 0.88} ${waist * 0.18} ${tip} 0 ${tip} C ${-waist * 0.18} ${tip} ${-waist * 0.4} ${tip * 0.88} ${-waist} ${tip * 0.64} C ${-width * 0.7} ${tip * 0.2} ${-width} ${-base * 0.12} 0 ${-base} Z`;
}

function sprigLeaves({
  stem,
  stations,
  start,
  end,
  baseLength,
  tipLength,
  opacity,
  pairSpread,
}: {
  stem: [Point, Point, Point, Point];
  stations: number;
  start: number;
  end: number;
  baseLength: number;
  tipLength: number;
  opacity: number;
  pairSpread: number;
}): Array<LeafSpec> {
  const [a, b, c, d] = stem;
  return Array.from({ length: stations }, (_, index) => {
    const linear = index / (stations - 1);
    const t = start + (end - start) * linear;
    const point = bezierPoint(a, b, c, d, t);
    const along = bezierAngle(a, b, c, d, t);
    const length = baseLength + (tipLength - baseLength) * linear;
    const side = index % 2 === 0 ? -1 : 1;
    const twist = ((index * 11) % 9) - 4;
    return {
      length,
      opacity,
      rotate: along + side * (pairSpread + (index % 3) * 4) + twist,
      width: length / 6,
      x: point.x + side * 1.1,
      y: point.y,
    };
  });
}

const MAIN_STEM: [Point, Point, Point, Point] = [
  { x: 78, y: 98 },
  { x: 72, y: 70 },
  { x: 64, y: 38 },
  { x: 56, y: 8 },
];

const BACK_STEM: [Point, Point, Point, Point] = [
  { x: 88, y: 90 },
  { x: 82, y: 64 },
  { x: 76, y: 42 },
  { x: 70, y: 22 },
];

const MAIN_LEAVES = sprigLeaves({
  baseLength: 13,
  end: 0.94,
  opacity: 0.7,
  pairSpread: 54,
  start: 0.06,
  stations: 13,
  stem: MAIN_STEM,
  tipLength: 7.5,
});

const BACK_LEAVES = sprigLeaves({
  baseLength: 9.5,
  end: 0.9,
  opacity: 0.4,
  pairSpread: 50,
  start: 0.1,
  stations: 8,
  stem: BACK_STEM,
  tipLength: 6,
});

const MAIN_PATH = `M ${MAIN_STEM[0].x} ${MAIN_STEM[0].y} C ${MAIN_STEM[1].x} ${MAIN_STEM[1].y}, ${MAIN_STEM[2].x} ${MAIN_STEM[2].y}, ${MAIN_STEM[3].x} ${MAIN_STEM[3].y}`;
const BACK_PATH = `M ${BACK_STEM[0].x} ${BACK_STEM[0].y} C ${BACK_STEM[1].x} ${BACK_STEM[1].y}, ${BACK_STEM[2].x} ${BACK_STEM[2].y}, ${BACK_STEM[3].x} ${BACK_STEM[3].y}`;

/**
 * Full-card eucalyptus sprig. The layer is inset 0 so leaves are not clipped
 * by a right-side box; only the card's rounded rect clips. Zero image bytes.
 */
export function WatercolorLeaves() {
  const rawId = useId();
  const id = rawId.replaceAll(':', '');
  const edge = `${id}-edge`;

  return (
    <Box aria-hidden="true" data-watercolor-leaves="" sx={leavesSx}>
      <Box aria-hidden="true" data-watercolor-blooms="" sx={bloomsSx} />
      <svg
        aria-hidden="true"
        fill="none"
        height="100%"
        overflow="visible"
        preserveAspectRatio="none"
        style={{ display: 'block', overflow: 'visible' }}
        viewBox="0 0 100 100"
        width="100%"
      >
        <defs>
          <filter height="180%" id={edge} width="180%" x="-40%" y="-40%">
            <feTurbulence
              baseFrequency="0.04 0.055"
              numOctaves="3"
              result="noise"
              seed="7"
              type="fractalNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              result="displaced"
              scale="1.4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.08" />
          </filter>
        </defs>
        <g fill={SPRIG} filter={`url(#${edge})`}>
          <path
            d={BACK_PATH}
            fill="none"
            opacity="0.36"
            stroke={SPRIG}
            strokeLinecap="round"
            strokeWidth="0.28"
          />
          {BACK_LEAVES.map((leaf) => (
            <path
              d={lanceolate(leaf.length, leaf.width)}
              data-watercolor-leaf=""
              key={`back-${leaf.x}-${leaf.y}-${leaf.rotate}`}
              opacity={leaf.opacity}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate})`}
            />
          ))}
          <path
            d={MAIN_PATH}
            fill="none"
            opacity="0.6"
            stroke={SPRIG}
            strokeLinecap="round"
            strokeWidth="0.32"
          />
          {MAIN_LEAVES.map((leaf) => (
            <path
              d={lanceolate(leaf.length, leaf.width)}
              data-watercolor-leaf=""
              key={`main-${leaf.x}-${leaf.y}-${leaf.rotate}`}
              opacity={leaf.opacity}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate})`}
            />
          ))}
        </g>
      </svg>
    </Box>
  );
}
