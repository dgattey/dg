'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { useId } from 'react';

const leavesSx: SxObject = {
  '[data-greenhouse-frame] &': {
    opacity: 0.92,
  },
  height: '118%',
  pointerEvents: 'none',
  position: 'absolute',
  right: '-6%',
  top: '-4%',
  width: '78%',
  zIndex: 3,
};

/**
 * Soft-edged watercolor foliage for the greenhouse now-playing tile.
 * Filters stay inline so this is zero image bytes.
 */
export function WatercolorLeaves() {
  const rawId = useId();
  const id = rawId.replaceAll(':', '');
  const paper = `${id}-paper`;
  const wash = `${id}-wash`;

  return (
    <Box aria-hidden="true" data-watercolor-leaves="" sx={leavesSx}>
      <svg
        aria-hidden="true"
        fill="none"
        height="100%"
        preserveAspectRatio="xMaxYMax slice"
        viewBox="0 0 360 300"
        width="100%"
      >
        <defs>
          <filter height="160%" id={paper} width="160%" x="-30%" y="-30%">
            <feTurbulence
              baseFrequency="0.032 0.046"
              numOctaves="3"
              result="noise"
              seed="7"
              type="fractalNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              result="displaced"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur in="displaced" result="soft" stdDeviation="1.8" />
            <feColorMatrix in="soft" type="saturate" values="0.88" />
          </filter>
          <filter height="140%" id={wash} width="140%" x="-20%" y="-20%">
            <feTurbulence
              baseFrequency="0.7"
              numOctaves="2"
              result="grain"
              seed="3"
              type="fractalNoise"
            />
            <feColorMatrix
              in="grain"
              type="matrix"
              values="0 0 0 0 0.35 0 0 0 0 0.38 0 0 0 0 0.2 0 0 0 0.18 0"
            />
          </filter>
        </defs>
        <g filter={`url(#${paper})`} opacity="0.86">
          <path
            d="M318 286c-28-64-18-128 36-176-18 58-4 118 28 158-28 16-48 18-64 18Z"
            fill="rgb(92 108 50 / 0.42)"
          />
          <path
            d="M246 272c-8-46 22-92 78-122-22 48-8 94 20 126-38 12-70 8-98-4Z"
            fill="rgb(122 132 58 / 0.4)"
          />
          <path
            d="M204 168c38-8 72 14 86 54-32 18-74 20-108 4 6-22 10-40 22-58Z"
            fill="rgb(168 148 64 / 0.38)"
          />
          <ellipse
            cx="292"
            cy="96"
            fill="rgb(186 168 78 / 0.36)"
            rx="46"
            ry="72"
            transform="rotate(28 292 96)"
          />
          <ellipse
            cx="238"
            cy="128"
            fill="rgb(110 124 56 / 0.4)"
            rx="34"
            ry="58"
            transform="rotate(-18 238 128)"
          />
          <ellipse
            cx="304"
            cy="188"
            fill="rgb(86 102 46 / 0.44)"
            rx="40"
            ry="66"
            transform="rotate(12 304 188)"
          />
          <ellipse
            cx="198"
            cy="226"
            fill="rgb(150 132 56 / 0.34)"
            rx="36"
            ry="54"
            transform="rotate(-32 198 226)"
          />
          <path
            d="M168 248c26-36 70-44 108-18-18 32-58 48-102 40 0-8-2-14-6-22Z"
            fill="rgb(98 116 52 / 0.36)"
          />
          <ellipse
            cx="326"
            cy="142"
            fill="rgb(210 186 96 / 0.28)"
            rx="28"
            ry="44"
            transform="rotate(40 326 142)"
          />
        </g>
        <rect filter={`url(#${wash})`} height="300" opacity="0.28" width="360" />
      </svg>
    </Box>
  );
}
