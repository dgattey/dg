import type { PaletteOptions } from '@mui/material';
import { BRAND, onCanvas, type SchemeColor } from './color';

type AdaptivePaletteColor = Readonly<{
  contrastText: SchemeColor;
  contrastTextChannel: undefined;
  dark: SchemeColor;
  darkChannel: undefined;
  light: SchemeColor;
  lightChannel: undefined;
  main: SchemeColor;
  mainChannel: undefined;
}>;

type AdaptivePaletteColorInput = Pick<
  AdaptivePaletteColor,
  'contrastText' | 'dark' | 'light' | 'main'
>;

const adaptivePaletteColor = ({
  contrastText,
  dark,
  light,
  main,
}: AdaptivePaletteColorInput): AdaptivePaletteColor => ({
  contrastText,
  contrastTextChannel: undefined,
  dark,
  darkChannel: undefined,
  light,
  lightChannel: undefined,
  main,
  mainChannel: undefined,
});

export function getPalette(): PaletteOptions {
  const palette = {
    action: {
      active: onCanvas(54),
      activeChannel: undefined,
      disabled: onCanvas(26),
      disabledBackground: onCanvas(12),
      focus: onCanvas(12),
      hover: onCanvas(4),
      selected: onCanvas(8),
      selectedChannel: undefined,
    },
    background: {
      default: BRAND.defaultBackground,
      defaultChannel: undefined,
      paper: BRAND.paperBackground,
      paperChannel: undefined,
    },
    card: {
      border: BRAND.cardBorder,
    },
    divider: onCanvas(12),
    dividerChannel: undefined,
    error: adaptivePaletteColor({
      contrastText: BRAND.errorContrastText,
      dark: BRAND.errorDark,
      light: BRAND.errorLight,
      main: BRAND.error,
    }),
    info: adaptivePaletteColor({
      contrastText: BRAND.infoContrastText,
      dark: BRAND.infoDark,
      light: BRAND.infoLight,
      main: BRAND.info,
    }),
    primary: adaptivePaletteColor({
      contrastText: BRAND.primaryContrastText,
      dark: BRAND.primaryDark,
      light: BRAND.primaryLight,
      main: BRAND.primary,
    }),
    secondary: adaptivePaletteColor({
      contrastText: BRAND.secondaryContrastText,
      dark: BRAND.secondaryDark,
      light: BRAND.secondaryLight,
      main: BRAND.secondary,
    }),
    success: adaptivePaletteColor({
      contrastText: BRAND.successContrastText,
      dark: BRAND.successDark,
      light: BRAND.successLight,
      main: BRAND.success,
    }),
    text: {
      disabled: onCanvas(38),
      h1: BRAND.h1,
      h2: BRAND.h2,
      h3: BRAND.h3,
      h4: BRAND.h4,
      h5: BRAND.h5,
      h6: BRAND.h6,
      primary: BRAND.text,
      primaryChannel: undefined,
      secondary: BRAND.mutedText,
      secondaryChannel: undefined,
    },
    warning: adaptivePaletteColor({
      contrastText: BRAND.warningContrastText,
      dark: BRAND.warningDark,
      light: BRAND.warningLight,
      main: BRAND.warning,
    }),
  };

  return palette;
}
