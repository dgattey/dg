import { PaletteMode } from '@mui/material';
import { TypographyOptions } from '@mui/material/styles/createTypography';
import { COLORS } from 'ui/theme/color';

/**
 * Get typography styles for a certain color mode.
 */
export const getTypography = (mode: PaletteMode): TypographyOptions => {
  const scopedColors = mode === 'light' ? COLORS.LIGHT : COLORS.DARK;
  return {
    fontFamily: [
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Ubuntu',
      'Cantarell',
      '"Noto Sans"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ].join(','),
    fontSize: 20,
    h1: {
      fontSize: 34,
      fontWeight: 700,
      color: scopedColors.H1,
    },
    h2: {
      fontSize: 29.75,
      fontWeight: 700,
      color: scopedColors.H2,
    },
    h3: {
      fontSize: 25.5,
      fontWeight: 700,
      color: scopedColors.H3,
    },
    h4: {
      fontSize: 21.25,
      fontWeight: 700,
      color: scopedColors.H4,
    },
    h5: {
      fontSize: 19.125,
      fontWeight: 700,
      color: scopedColors.H5,
    },
    h6: {
      fontSize: 17,
      fontWeight: 700,
      color: scopedColors.H6,
    },
    body1: {
      fontSize: 17,
    },
    body2: {
      fontSize: 17,
      color: COLORS.MUTED_TEXT,
    },
    overline: {
      fontSize: 11.125,
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    caption: {
      fontSize: 12.75,
      fontWeight: 600,
    },
  };
};
