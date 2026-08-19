import type { Theme, TypographyVariantsOptions } from '@mui/material/styles';

/**
 * Body and UI type. Stays on every surface, including greenhouse.
 */
export const FONT_SANS_STACK = [
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
].join(',');

/**
 * Display role. System serif only — no `@font-face`, no `next/font`.
 * Greenhouse sets `--font-display` to this; `:root` keeps the sans stack so
 * flag-off headings stay as they are.
 */
export const FONT_DISPLAY_STACK = [
  'ui-serif',
  '"Iowan Old Style"',
  '"Palatino Linotype"',
  'Palatino',
  'Georgia',
  '"Times New Roman"',
  'Times',
  'serif',
].join(',');

export const HEADING_FONT_SIZE_DEFAULT = 'clamp(1.75rem, 1.2rem + 2.5vw, 2.125rem)';

export const HEADING_FONT_SIZE_DISPLAY = 'clamp(2.25rem, 1.4rem + 4vw, 3.25rem)';

/**
 * Type CSS variables consumed by heading styles. Greenhouse overrides the
 * display stack and heading variant on its frame; `:root` matches today's sans
 * small-caps h1.
 */
export function getTypeCssVars(): Record<`--${string}`, string> {
  return {
    '--font-display': FONT_SANS_STACK,
    '--heading-font-size': HEADING_FONT_SIZE_DEFAULT,
    '--heading-font-stretch': 'expanded',
    '--heading-font-variant': 'all-small-caps',
  };
}

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
    display: {
      fontFamily: 'var(--font-display)',
      fontSize: HEADING_FONT_SIZE_DISPLAY,
      fontStretch: 'normal',
      fontVariant: 'normal',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.12,
    },
    fontFamily: FONT_SANS_STACK,
    fontSize: 20,
    h1: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--heading-font-size)',
      fontStretch: 'var(--heading-font-stretch)',
      fontVariant: 'var(--heading-font-variant)',
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
