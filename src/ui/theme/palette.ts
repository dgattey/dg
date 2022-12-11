import { PaletteOptions, PaletteMode } from '@mui/material';
import { COLORS } from 'ui/theme/color';

const sharedPalette: Partial<PaletteOptions> & { secondary: { main: string } } = {
  primary: {
    main: COLORS.PRIMARY,
  },
  secondary: {
    main: COLORS.SECONDARY,
  },
};

const lightPalette: PaletteOptions = {
  ...sharedPalette,
  mode: 'light',
  card: {
    background: COLORS.LIGHT.CARD_BACKGROUND,
    border: COLORS.LIGHT.CARD_BORDER,
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
  },
};

const darkPalette: PaletteOptions = {
  ...sharedPalette,
  mode: 'dark',
  card: {
    background: COLORS.DARK.CARD_BACKGROUND,
    border: COLORS.DARK.CARD_BORDER,
  },
  background: {
    default: COLORS.DARK.DEFAULT_BACKGROUND,
    paper: COLORS.DARK.PAPER_BACKGROUND,
  },
  warning: { main: COLORS.DARK.YELLOW },
  active: {
    main: sharedPalette.secondary.main,
  },
  text: {
    primary: COLORS.DARK.TEXT,
  },
};

/**
 * Returns a palette options for theme creation based on the color mode.
 */
export const getPalette = (mode: PaletteMode) => (mode === 'light' ? lightPalette : darkPalette);
