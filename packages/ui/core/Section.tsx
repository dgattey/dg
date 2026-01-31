import type { BoxProps } from '@mui/material';
import { Box } from '@mui/material';
import { forwardRef } from 'react';
import type { SxObject } from '../theme';

const sectionSx: SxObject = {
  marginBottom: { lg: 4.32, md: 3.6, sm: 3, xl: 5.184 },
};

/**
 * Large, semantically meaningful section on a page, with padding.
 */
export const Section = forwardRef<HTMLElement, Omit<BoxProps, 'sx'> & { sx?: SxObject }>(
  function Section({ sx, ...props }, ref) {
    const mergedSx = sx ? { ...sectionSx, ...sx } : sectionSx;
    return <Box component="section" ref={ref} {...props} sx={mergedSx} />;
  },
);
