import { createTheme, PaletteOptions, PaletteMode } from '@mui/material';

const lightPalette: Partial<PaletteOptions> = {
  mode: 'light',
  background: {
    default: 'hsl(206, 60%, 96%)',
    paper: 'hsl(206, 60%, 96%)',
  },
  text: {
    primary: '#415462',
  },
};

const darkPalette: Partial<PaletteOptions> = {
  mode: 'dark',
  background: {
    default: 'rgb(17, 25, 31)',
    paper: 'hsl(206, 24%, 22%)',
  },
  text: {
    primary: '#bbc6ce',
  },
};

const getPalette = (mode: PaletteMode) => (mode === 'light' ? lightPalette : darkPalette);

/**
 * Our MUI theme, customized, and dark/light mode compatible.
 */
export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: getPalette(mode),
    typography: {
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
      fontSize: 14.875, // effective font size of 17px
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
      },
    },
  });
