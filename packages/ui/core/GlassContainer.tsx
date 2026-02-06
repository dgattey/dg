import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import { createBouncyTransition } from '../helpers/bouncyTransition';
import type { SxObject } from '../theme';

export interface GlassContainerProps extends Omit<BoxProps, 'sx'> {
  /**
   * Additional styling to apply to the container
   */
  sx?: SxObject;
}

/**
 * Theme-adaptive background using MUI CSS variables.
 * var(--mui-palette-background-default) is dark in dark mode, light in light mode.
 */
const GLASS_BG = 'color-mix(in srgb, var(--mui-palette-background-default) 70%, transparent)';
const GLASS_BORDER = '1px solid color-mix(in srgb, var(--mui-palette-common-white) 12%, transparent)';
const GLASS_SHADOW = `
  inset 0 1px 0 color-mix(in srgb, var(--mui-palette-common-white) 15%, transparent),
  0px 1px 5px color-mix(in srgb, var(--mui-palette-common-black) 12%, transparent),
  0px 6px 16px color-mix(in srgb, var(--mui-palette-common-black) 8%, transparent)`;

const glassContainerBaseSx: SxObject = {
  backdropFilter: 'blur(12px) saturate(150%)',
  backgroundColor: GLASS_BG,
  border: GLASS_BORDER,
  borderRadius: '32px',
  boxShadow: GLASS_SHADOW,
  position: 'relative',
  ...createBouncyTransition(['background-color', 'border-color', 'box-shadow'], 375),
};

/**
 * A reusable glass morphism container with backdrop blur effects.
 * Provides a translucent background with glass-like styling that adapts to the current theme.
 */
export function GlassContainer({ children, sx, ...props }: GlassContainerProps) {
  const mergedSx = sx ? { ...glassContainerBaseSx, ...sx } : glassContainerBaseSx;
  return (
    <Box {...props} sx={mergedSx}>
      {children}
    </Box>
  );
}
