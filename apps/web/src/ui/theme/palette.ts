import { PaletteOptions, PaletteMode } from '@mui/material';
import { COLORS } from 'ui/theme/color';

const lightPalette: PaletteOptions = {
  primary: {
    main: COLORS.PRIMARY,
  },
  secondary: {
    main: COLORS.SECONDARY,
  },
  card: {
    background: COLORS.LIGHT.CARD_BACKGROUND,
    border: COLORS.LIGHT.CARD_BORDER,
  },
  code: {
    background: COLORS.LIGHT.CODE_BACKGROUND,
    text: COLORS.MUTED_TEXT,
  },
  background: {
    default: COLORS.LIGHT.DEFAULT_BACKGROUND,
    paper: COLORS.LIGHT.PAPER_BACKGROUND,
  },
  warning: { main: COLORS.LIGHT.YELLOW },
  active: {
    main: COLORS.LIGHT.YELLOW,
  },
  text: {
    primary: COLORS.LIGHT.TEXT,
    secondary: COLORS.MUTED_TEXT,
    h1: COLORS.LIGHT.H1,
    h2: COLORS.LIGHT.H2,
    h3: COLORS.LIGHT.H3,
    h4: COLORS.LIGHT.H4,
    h5: COLORS.LIGHT.H5,
    h6: COLORS.LIGHT.H6,
  },
  map: {
    markerBackground: COLORS.LIGHT.MAP.MARKER_BACKGROUND,
    markerBorder: COLORS.LIGHT.MAP.MARKER_BORDER,
  },
};

const darkPalette: PaletteOptions = {
  primary: {
    main: COLORS.PRIMARY,
  },
  secondary: {
    main: COLORS.SECONDARY,
  },
  card: {
    background: COLORS.DARK.CARD_BACKGROUND,
    border: COLORS.DARK.CARD_BORDER,
  },
  code: {
    background: COLORS.DARK.CODE_BACKGROUND,
    text: COLORS.MUTED_TEXT,
  },
  background: {
    default: COLORS.DARK.DEFAULT_BACKGROUND,
    paper: COLORS.DARK.PAPER_BACKGROUND,
  },
  warning: { main: COLORS.DARK.YELLOW },
  active: {
    main: COLORS.SECONDARY,
  },
  text: {
    primary: COLORS.DARK.TEXT,
    secondary: COLORS.MUTED_TEXT,
    h1: COLORS.DARK.H1,
    h2: COLORS.DARK.H2,
    h3: COLORS.DARK.H3,
    h4: COLORS.DARK.H4,
    h5: COLORS.DARK.H5,
    h6: COLORS.DARK.H6,
  },
  map: {
    markerBackground: COLORS.DARK.MAP.MARKER_BACKGROUND,
    markerBorder: COLORS.DARK.MAP.MARKER_BORDER,
  },
};

/**
 * Returns a palette options for theme creation based on the color mode.
 */
export const getPalette = (mode: PaletteMode) => (mode === 'light' ? lightPalette : darkPalette);
