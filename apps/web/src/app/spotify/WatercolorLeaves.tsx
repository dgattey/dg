'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { useId } from 'react';

const SPRIG = '#3e5a3a';

const leavesSx: SxObject = {
  '[data-greenhouse-frame] &': {
    opacity: 1,
  },
  bottom: '-14%',
  height: '126%',
  pointerEvents: 'none',
  position: 'absolute',
  right: '-12%',
  top: 'auto',
  width: '72%',
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
  const tip = length * 0.68;
  const base = length * 0.32;
  const waist = width * 0.42;
  return `M 0 ${-base} C ${width} ${-base * 0.15} ${width * 0.72} ${tip * 0.22} ${waist} ${tip * 0.62} C ${waist * 0.45} ${tip * 0.86} ${waist * 0.2} ${tip} 0 ${tip} C ${-waist * 0.2} ${tip} ${-waist * 0.45} ${tip * 0.86} ${-waist} ${tip * 0.62} C ${-width * 0.72} ${tip * 0.22} ${-width} ${-base * 0.15} 0 ${-base} Z`;
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
  const leaves: Array<LeafSpec> = [];
  for (let index = 0; index < stations; index += 1) {
    const linear = index / (stations - 1);
    const t = start + (end - start) * linear ** 0.55;
    const point = bezierPoint(a, b, c, d, t);
    const along = bezierAngle(a, b, c, d, t);
    const tipMix = linear ** 1.05;
    const length = baseLength + (tipLength - baseLength) * tipMix;
    const cluster = 2 + Math.round(linear * 2.2);
    for (let sideIndex = 0; sideIndex < cluster; sideIndex += 1) {
      const side = sideIndex % 2 === 0 ? -1 : 1;
      const layer = Math.floor(sideIndex / 2);
      const flare = pairSpread - linear * 10 + layer * 16 + (index % 5) * 4 + sideIndex * 3;
      const twist = ((index * 13 + sideIndex * 19) % 17) - 8;
      const sizeJitter = 1 - layer * 0.22 - (index % 4) * 0.05 - sideIndex * 0.03;
      leaves.push({
        length: length * sizeJitter,
        opacity: Math.max(0.28, opacity - layer * 0.08 - sideIndex * 0.03),
        rotate: along + side * flare + twist,
        width: length * sizeJitter * (0.2 + (index % 3) * 0.03),
        x: point.x + side * (3.2 - linear * 1.4) + layer * side * 1.6,
        y: point.y + (layer - 0.4) * 2.2,
      });
    }
  }
  return leaves;
}

const MAIN_STEM: [Point, Point, Point, Point] = [
  { x: 292, y: 352 },
  { x: 262, y: 248 },
  { x: 208, y: 128 },
  { x: 148, y: 18 },
];

const BACK_STEM: [Point, Point, Point, Point] = [
  { x: 326, y: 328 },
  { x: 298, y: 232 },
  { x: 264, y: 158 },
  { x: 228, y: 86 },
];

const MAIN_LEAVES = sprigLeaves({
  baseLength: 58,
  end: 0.97,
  opacity: 0.7,
  pairSpread: 56,
  start: 0.03,
  stations: 20,
  stem: MAIN_STEM,
  tipLength: 26,
});

const BACK_LEAVES = sprigLeaves({
  baseLength: 40,
  end: 0.92,
  opacity: 0.4,
  pairSpread: 48,
  start: 0.08,
  stations: 13,
  stem: BACK_STEM,
  tipLength: 18,
});

const MAIN_PATH = `M ${MAIN_STEM[0].x} ${MAIN_STEM[0].y} C ${MAIN_STEM[1].x} ${MAIN_STEM[1].y}, ${MAIN_STEM[2].x} ${MAIN_STEM[2].y}, ${MAIN_STEM[3].x} ${MAIN_STEM[3].y}`;
const BACK_PATH = `M ${BACK_STEM[0].x} ${BACK_STEM[0].y} C ${BACK_STEM[1].x} ${BACK_STEM[1].y}, ${BACK_STEM[2].x} ${BACK_STEM[2].y}, ${BACK_STEM[3].x} ${BACK_STEM[3].y}`;

/**
 * Dense eucalyptus / fern sprig for the greenhouse now-playing tile.
 * Zero image bytes: SVG paths plus a painted-edge displacement.
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
          <filter height="220%" id={edge} width="220%" x="-60%" y="-60%">
            <feTurbulence
              baseFrequency="0.035 0.05"
              numOctaves="3"
              result="noise"
              seed="7"
              type="fractalNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              result="displaced"
              scale="11"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.45" />
          </filter>
          <filter height="260%" id={bloom} width="260%" x="-80%" y="-80%">
            <feGaussianBlur stdDeviation="42" />
          </filter>
        </defs>
        <g filter={`url(#${bloom})`}>
          <ellipse cx="268" cy="292" fill="rgb(217 194 122 / 0.28)" rx="132" ry="98" />
          <ellipse cx="312" cy="210" fill="rgb(217 194 122 / 0.18)" rx="108" ry="86" />
          <ellipse cx="198" cy="248" fill="rgb(138 154 91 / 0.22)" rx="118" ry="92" />
          <ellipse cx="296" cy="338" fill="rgb(138 154 91 / 0.16)" rx="124" ry="78" />
        </g>
        <g fill={SPRIG} filter={`url(#${edge})`}>
          <path
            d={BACK_PATH}
            fill="none"
            opacity="0.38"
            stroke={SPRIG}
            strokeLinecap="round"
            strokeWidth="1.2"
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
            opacity="0.62"
            stroke={SPRIG}
            strokeLinecap="round"
            strokeWidth="1.45"
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
