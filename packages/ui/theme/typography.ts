import type { CSSProperties } from 'react';

type TypographyVariants = {
  body1: CSSProperties;
  body2: CSSProperties;
  button: CSSProperties;
  caption: CSSProperties;
  code: CSSProperties;
  fontFamily: string;
  fontSize: number;
  h1: CSSProperties;
  h2: CSSProperties;
  h3: CSSProperties;
  h4: CSSProperties;
  h5: CSSProperties;
  h6: CSSProperties;
  overline: CSSProperties;
};

/**
 * Get typography styles for the theme.
 */
export function getTypography(): TypographyVariants {
  return {
    body1: {
      fontSize: 17,
    },
    body2: {
      fontSize: 17,
    },
    button: {
      fontSize: 'clamp(18px, 1.6vw, 20px)',
      fontWeight: 600,
    },
    caption: {
      fontSize: 15,
      fontWeight: 400,
    },
    code: {
      borderRadius: '16px',
      fontFamily:
        '"Menlo","Consolas","Roboto Mono","Ubuntu Monospace","Noto Mono","Oxygen Mono","Liberation Mono",monospace,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
      fontSize: 15,
      lineHeight: 1.875,
      padding: '6px 8px',
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
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ].join(','),
    fontSize: 20,
    h1: {
      fontSize: 'clamp(1.75rem, 1.2rem + 2.5vw, 2.125rem)',
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
      fontWeight: 600,
    },
    h6: {
      fontSize: 16,
      fontWeight: 600,
    },
    overline: {
      fontSize: 16,
      fontWeight: 600,
    },
  };
}
