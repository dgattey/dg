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
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur in="displaced" result="soft" stdDeviation="0.55" />
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
        <g filter={`url(#${paper})`} opacity="0.94">
          <path
            d="M248 64c10 72 36 132 78 176"
            stroke="rgb(86 96 48 / 0.38)"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <ellipse
            cx="236"
            cy="78"
            fill="rgb(176 158 72 / 0.72)"
            rx="16"
            ry="28"
            transform="rotate(-38 236 78)"
          />
          <ellipse
            cx="268"
            cy="70"
            fill="rgb(122 132 58 / 0.7)"
            rx="15"
            ry="26"
            transform="rotate(32 268 70)"
          />
          <ellipse
            cx="252"
            cy="118"
            fill="rgb(96 110 50 / 0.74)"
            rx="17"
            ry="30"
            transform="rotate(-18 252 118)"
          />
          <ellipse
            cx="286"
            cy="112"
            fill="rgb(186 164 78 / 0.64)"
            rx="14"
            ry="25"
            transform="rotate(28 286 112)"
          />
          <ellipse
            cx="270"
            cy="158"
            fill="rgb(110 122 56 / 0.72)"
            rx="16"
            ry="28"
            transform="rotate(-26 270 158)"
          />
          <ellipse
            cx="308"
            cy="154"
            fill="rgb(150 136 60 / 0.66)"
            rx="15"
            ry="27"
            transform="rotate(22 308 154)"
          />
          <ellipse
            cx="292"
            cy="200"
            fill="rgb(88 102 48 / 0.7)"
            rx="17"
            ry="29"
            transform="rotate(-14 292 200)"
          />
          <ellipse
            cx="328"
            cy="198"
            fill="rgb(168 150 68 / 0.62)"
            rx="14"
            ry="24"
            transform="rotate(30 328 198)"
          />
          <ellipse
            cx="314"
            cy="242"
            fill="rgb(104 116 52 / 0.68)"
            rx="16"
            ry="26"
            transform="rotate(-22 314 242)"
          />
          <ellipse
            cx="346"
            cy="238"
            fill="rgb(138 128 58 / 0.6)"
            rx="13"
            ry="22"
            transform="rotate(18 346 238)"
          />
          <ellipse
            cx="334"
            cy="278"
            fill="rgb(92 106 48 / 0.64)"
            rx="15"
            ry="24"
            transform="rotate(-8 334 278)"
          />
        </g>
        <rect filter={`url(#${wash})`} height="300" opacity="0.28" width="360" />
      </svg>
    </Box>
  );
}
