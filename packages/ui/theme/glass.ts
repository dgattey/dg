import type { PaletteMode } from '@mui/material';

/**
 * Pre-computed percentage values for glass morphism effects.
 * These are used in color-mix() for the glass container styling.
 */
const lightGlass = {
  darkInset1: '12%',
  darkInset2: '20%',
  darkInset3: '20%',
  darkInset4: '10%',
  darkShadow1: '10%',
  darkShadow2: '8%',
  lightBorder: '10%',
  lightInset1: '10%',
  lightInset2: '90%',
  lightInset3: '80%',
  lightInset4: '60%',
} as const;

const darkGlass = {
  darkInset1: '24%',
  darkInset2: '40%',
  darkInset3: '40%',
  darkInset4: '20%',
  darkShadow1: '20%',
  darkShadow2: '16%',
  lightBorder: '3%',
  lightInset1: '3%',
  lightInset2: '27%',
  lightInset3: '24%',
  lightInset4: '18%',
} as const;

/**
 * Returns glass effect percentage values based on current color mode.
 * These are pre-computed for use in color-mix() CSS functions.
 */
export const getGlass = (mode: PaletteMode) => (mode === 'light' ? lightGlass : darkGlass);
