'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box, keyframes } from '@mui/material';
import type { ReactNode } from 'react';

type BouncingCardShellProps = {
  children: ReactNode;
  isPlaying: boolean;
};

// Subtle bounce animation for the whole card
const cardBounce = keyframes`
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.012) translateY(-2px);
  }
`;

const getShellSx = (isPlaying: boolean): SxObject => ({
  animation: isPlaying ? `${cardBounce} 1.8s ease-in-out infinite` : 'none',
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
