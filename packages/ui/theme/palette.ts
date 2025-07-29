import type { PaletteMode, PaletteOptions } from '@mui/material';
import { COLORS } from './color';

const lightPalette: PaletteOptions = {
  background: {
    default: COLORS.LIGHT.DEFAULT_BACKGROUND,
    paper: COLORS.LIGHT.PAPER_BACKGROUND,
  },
  card: {
    border: COLORS.LIGHT.CARD_BORDER,
  },
  map: {
    markerBackground: COLORS.LIGHT.MAP.MARKER_BACKGROUND,
    markerBorder: COLORS.LIGHT.MAP.MARKER_BORDER,
  },
  primary: {
    main: COLORS.LIGHT.PRIMARY,
  },
  secondary: {
    main: COLORS.LIGHT.SECONDARY,
  },
  text: {
    h1: COLORS.LIGHT.H1,
    h2: COLORS.LIGHT.H2,
    h3: COLORS.LIGHT.H3,
    h4: COLORS.LIGHT.H4,
    h5: COLORS.LIGHT.H5,
    h6: COLORS.LIGHT.H6,
    primary: COLORS.LIGHT.TEXT,
    secondary: COLORS.LIGHT.MUTED_TEXT,
  },
};

const darkPalette: PaletteOptions = {
  background: {
    default: COLORS.DARK.DEFAULT_BACKGROUND,
    paper: COLORS.DARK.PAPER_BACKGROUND,
  },
  card: {
    border: COLORS.DARK.CARD_BORDER,
  },
  map: {
    markerBackground: COLORS.DARK.MAP.MARKER_BACKGROUND,
    markerBorder: COLORS.DARK.MAP.MARKER_BORDER,
  },
  primary: {
    main: COLORS.DARK.PRIMARY,
  },
  secondary: {
    main: COLORS.DARK.SECONDARY,
  },
  text: {
    h1: COLORS.DARK.H1,
    h2: COLORS.DARK.H2,
    h3: COLORS.DARK.H3,
    h4: COLORS.DARK.H4,
    h5: COLORS.DARK.H5,
    h6: COLORS.DARK.H6,
    primary: COLORS.DARK.TEXT,
    secondary: COLORS.DARK.MUTED_TEXT,
  },
};

/**
 * Returns a palette options for theme creation based on the color mode.
 */
export const getPalette = (mode: PaletteMode) => (mode === 'light' ? lightPalette : darkPalette);
