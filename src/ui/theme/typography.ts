import { Theme } from '@mui/material';
import { TypographyOptions } from '@mui/material/styles/createTypography';

/**
 * Get typography styles for a certain color mode.
 */
export function getTypography(theme: Theme): TypographyOptions {
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
    },
    h2: {
      fontSize: 29.75,
      fontWeight: 700,
    },
    h3: {
      fontSize: 25.5,
      fontWeight: 700,
    },
    h4: {
      fontSize: 21.25,
      fontWeight: 700,
    },
    h5: {
      fontSize: 19.125,
      fontWeight: 700,
    },
    h6: {
      fontSize: 17,
      fontWeight: 700,
    },
    body1: {
      fontSize: 17,
    },
    body2: {
      fontSize: 17,
    },
    overline: {
      fontSize: 12,
      textTransform: 'uppercase',
      fontWeight: 600,
    },
    caption: {
      fontSize: 13,
      fontWeight: 600,
    },
    button: {
      fontSize: 17,
      fontWeight: 600,
    },
    code: {
      fontSize: 16,
      lineHeight: 1.875, // 30px
      fontFamily:
        '"Menlo","Consolas","Roboto Mono","Ubuntu Monospace","Noto Mono","Oxygen Mono","Liberation Mono",monospace,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      padding: theme.spacing(0.75, 1),
      borderRadius: theme.spacing(2),
    },
  };
}
