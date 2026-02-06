'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box, keyframes } from '@mui/material';
import type { ReactNode } from 'react';

type BouncingCardShellProps = {
  children: ReactNode;
  isPlaying: boolean;
};

// Springy bounce animation for the whole card
const cardBounce = keyframes`
  0% {
    transform: scale(1) translateY(0);
  }
  15% {
    transform: scale(1.012) translateY(-2px);
  }
  30% {
    transform: scale(0.998) translateY(0.5px);
  }
  45% {
    transform: scale(1.004) translateY(-0.5px);
  }
  60%, 100% {
    transform: scale(1) translateY(0);
  }
`;

const getShellSx = (isPlaying: boolean): SxObject => ({
  animation: isPlaying ? `${cardBounce} 1s cubic-bezier(0.34, 1.56, 0.64, 1) infinite` : 'none',
  isolation: 'isolate',
  overflow: 'visible',
  position: 'relative',
  willChange: isPlaying ? 'transform' : 'auto',
});

/**
 * Client component wrapper that adds a subtle bounce animation
 * when music is playing.
 */
export function BouncingCardShell({ children, isPlaying }: BouncingCardShellProps) {
  return <Box sx={getShellSx(isPlaying)}>{children}</Box>;
}
