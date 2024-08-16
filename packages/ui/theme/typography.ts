import type { Theme } from '@mui/material';
import type { TypographyOptions } from '@mui/material/styles/createTypography';

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
      fontStretch: 'expanded',
      fontVariant: 'all-small-caps',
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
      fontWeight: 600,
    },
    h5: {
      fontSize: 17,
      fontWeight: 600,
      fontStretch: 'semi-expanded',
    },
    h6: {
      fontSize: 16,
      fontWeight: 600,
    },
    body1: {
      fontSize: 17,
    },
    body2: {
      fontSize: 17,
    },
    overline: {
      fontSize: 13,
      fontVariant: 'all-small-caps',
      fontWeight: 500,
      fontStretch: 'expanded',
    },
    caption: {
      fontSize: 14,
      fontVariant: 'tabular-nums',
      fontWeight: 500,
    },
    button: {
      fontSize: 16,
      fontWeight: 600,
    },
    code: {
      fontSize: 15,
      lineHeight: 1.875, // 30px
      fontFamily:
        '"Menlo","Consolas","Roboto Mono","Ubuntu Monospace","Noto Mono","Oxygen Mono","Liberation Mono",monospace,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      padding: theme.spacing(0.75, 1),
      borderRadius: theme.spacing(2),
    },
  };
}
