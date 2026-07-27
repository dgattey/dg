import type { Theme, TypographyVariantsOptions } from '@mui/material/styles';

/**
 * Get typography styles for a certain color mode.
 */
export function getTypography(theme: Theme): TypographyVariantsOptions {
  return {
    body1: {
      fontSize: 17,
    },
    body2: {
      fontSize: 17,
    },
    button: {
      fontSize: 16,
      fontWeight: 600,
    },
    caption: {
      fontSize: 14,
      fontStretch: 'semi-expanded',
      fontWeight: 500,
    },
    code: {
      borderRadius: theme.spacing(2),
      fontFamily:
        '"Menlo","Consolas","Roboto Mono","Ubuntu Monospace","Noto Mono","Oxygen Mono","Liberation Mono",monospace,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      fontSize: 15,
      lineHeight: 1.875, // 30px
      padding: theme.spacing(0.75, 1),
    },
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
      fontSize: 'clamp(1.75rem, 1.2rem + 2.5vw, 2.125rem)',
      fontStretch: 'expanded',
      fontVariant: 'all-small-caps',
      fontWeight: 700,
    },
    h2: {
      fontSize: 'clamp(1.5rem, 1.1rem + 2vw, 1.859375rem)',
      fontWeight: 700,
    },
    h3: {
      fontSize: 'clamp(1.35rem, 1.05rem + 1.5vw, 1.546875rem)',
      fontWeight: 700,
    },
    h4: {
      fontSize: 20.5,
      fontWeight: 600,
    },
    h5: {
      fontSize: 16.5,
      fontStretch: 'semi-expanded',
      fontWeight: 600,
    },
    h6: {
      fontSize: 16,
      fontWeight: 600,
    },
    overline: {
      fontSize: 13,
      fontStretch: 'expanded',
      fontVariant: 'all-small-caps',
      fontWeight: 500,
    },
  };
}
