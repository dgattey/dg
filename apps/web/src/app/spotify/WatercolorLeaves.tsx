'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { useId } from 'react';

const SPRIG = '#3e5a3a';

const leavesSx: SxObject = {
  '[data-greenhouse-frame] &': {
    opacity: 1,
  },
  bottom: '-10%',
  height: '118%',
  pointerEvents: 'none',
  position: 'absolute',
  right: '-8%',
  top: 'auto',
  width: '62%',
  zIndex: 3,
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
  const tip = length * 0.58;
  const base = length * 0.42;
  return `M 0 ${-base} C ${width} ${-base * 0.2} ${width * 0.55} ${tip * 0.35} 0 ${tip} C ${-width * 0.55} ${tip * 0.35} ${-width} ${-base * 0.2} 0 ${-base} Z`;
}

function sprigLeaves(
  stem: [Point, Point, Point, Point],
  count: number,
  start: number,
  end: number,
  baseLength: number,
  tipLength: number,
  opacity: number,
): Array<LeafSpec> {
  const [a, b, c, d] = stem;
  return Array.from({ length: count }, (_, index) => {
    const t = start + ((end - start) * index) / (count - 1);
    const point = bezierPoint(a, b, c, d, t);
    const along = bezierAngle(a, b, c, d, t);
    const side = index % 2 === 0 ? -1 : 1;
    const flare = 58 + (index % 3) * 4;
    const length = baseLength + (tipLength - baseLength) * t;
    return {
      length,
      opacity,
      rotate: along + side * flare,
      width: length * 0.3,
      x: point.x,
      y: point.y,
    };
  });
}

const MAIN_STEM: [Point, Point, Point, Point] = [
  { x: 308, y: 348 },
  { x: 274, y: 246 },
  { x: 216, y: 132 },
  { x: 154, y: 22 },
];

const BACK_STEM: [Point, Point, Point, Point] = [
  { x: 332, y: 318 },
  { x: 304, y: 236 },
  { x: 268, y: 172 },
  { x: 236, y: 108 },
];

const MAIN_LEAVES = sprigLeaves(MAIN_STEM, 17, 0.06, 0.94, 26, 13, 0.7);
const BACK_LEAVES = sprigLeaves(BACK_STEM, 8, 0.12, 0.88, 18, 11, 0.48);

const MAIN_PATH = `M ${MAIN_STEM[0].x} ${MAIN_STEM[0].y} C ${MAIN_STEM[1].x} ${MAIN_STEM[1].y}, ${MAIN_STEM[2].x} ${MAIN_STEM[2].y}, ${MAIN_STEM[3].x} ${MAIN_STEM[3].y}`;
const BACK_PATH = `M ${BACK_STEM[0].x} ${BACK_STEM[0].y} C ${BACK_STEM[1].x} ${BACK_STEM[1].y}, ${BACK_STEM[2].x} ${BACK_STEM[2].y}, ${BACK_STEM[3].x} ${BACK_STEM[3].y}`;

/**
 * Fern / eucalyptus sprig for the greenhouse now-playing tile. Zero image bytes.
 */
export function WatercolorLeaves() {
  const rawId = useId();
  const id = rawId.replaceAll(':', '');
  const edge = `${id}-edge`;
  const bloom = `${id}-bloom`;

  return (
    <Box aria-hidden="true" data-watercolor-leaves="" sx={leavesSx}>
      <svg
        aria-hidden="true"
        fill="none"
        height="100%"
        preserveAspectRatio="xMaxYMax slice"
        viewBox="0 0 340 360"
        width="100%"
      >
        <defs>
          <filter height="180%" id={edge} width="180%" x="-40%" y="-40%">
            <feTurbulence
              baseFrequency="0.045 0.06"
              numOctaves="2"
              result="noise"
              seed="5"
              type="fractalNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              result="displaced"
              scale="2.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.35" />
          </filter>
          <filter height="180%" id={bloom} width="180%" x="-40%" y="-40%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>
        <g filter={`url(#${bloom})`}>
          <ellipse cx="248" cy="268" fill="rgb(198 176 78 / 0.28)" rx="118" ry="86" />
          <ellipse cx="300" cy="196" fill="rgb(168 150 64 / 0.22)" rx="92" ry="74" />
          <ellipse cx="188" cy="214" fill="rgb(120 132 64 / 0.18)" rx="86" ry="70" />
          <ellipse cx="276" cy="318" fill="rgb(214 190 96 / 0.16)" rx="100" ry="64" />
        </g>
        <g fill={SPRIG} filter={`url(#${edge})`}>
          <path
            d={BACK_PATH}
            fill="none"
            opacity="0.4"
            stroke={SPRIG}
            strokeLinecap="round"
            strokeWidth="1.15"
          />
          {BACK_LEAVES.map((leaf) => (
            <path
              d={lanceolate(leaf.length, leaf.width)}
              data-watercolor-leaf=""
              key={`back-${leaf.x}-${leaf.y}`}
              opacity={leaf.opacity}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate})`}
            />
          ))}
          <path
            d={MAIN_PATH}
            fill="none"
            opacity="0.62"
            stroke={SPRIG}
            strokeLinecap="round"
            strokeWidth="1.35"
          />
          {MAIN_LEAVES.map((leaf) => (
            <path
              d={lanceolate(leaf.length, leaf.width)}
              data-watercolor-leaf=""
              key={`main-${leaf.x}-${leaf.y}`}
              opacity={leaf.opacity}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rotate})`}
            />
          ))}
        </g>
      </svg>
    </Box>
  );
}
