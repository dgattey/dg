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
 * Greenhouse type scale. Sized off the 1440 mock (display 56–64, title 26–30,
 * body 14–15, eyebrow 11–12) and expressed as `clamp()` so 390 and 2560 share
 * one vocabulary. Applied only through a nested theme / `[data-greenhouse-type]`.
 */
export const GREENHOUSE_TYPE_SCALE = {
  body1: 'clamp(0.875rem, 0.8125rem + 0.14vw, 0.9375rem)',
  body2: 'clamp(0.8125rem, 0.76rem + 0.14vw, 0.875rem)',
  caption: 'clamp(0.6875rem, 0.64rem + 0.12vw, 0.75rem)',
  h1: 'clamp(2.25rem, 0.75rem + 3.4vw, 4rem)',
  h2: 'clamp(1.75rem, 1.05rem + 1.8vw, 2.5rem)',
  h3: 'clamp(1.375rem, 0.9rem + 1.15vw, 1.875rem)',
  h4: 'clamp(1.125rem, 0.85rem + 0.7vw, 1.375rem)',
  h5: 'clamp(0.8125rem, 0.7rem + 0.35vw, 1rem)',
  h6: 'clamp(0.8125rem, 0.7rem + 0.35vw, 1rem)',
  overline: 'clamp(0.6875rem, 0.625rem + 0.14vw, 0.75rem)',
} as const;

export const GREENHOUSE_TYPE_VARS: Record<`--${string}`, string> = {
  '--type-body1': GREENHOUSE_TYPE_SCALE.body1,
  '--type-body2': GREENHOUSE_TYPE_SCALE.body2,
  '--type-caption': GREENHOUSE_TYPE_SCALE.caption,
  '--type-h1': GREENHOUSE_TYPE_SCALE.h1,
  '--type-h3': GREENHOUSE_TYPE_SCALE.h3,
  '--type-h5': GREENHOUSE_TYPE_SCALE.h5,
  '--type-overline': GREENHOUSE_TYPE_SCALE.overline,
};

/**
 * MUI typography overrides for the greenhouse surface. Flag-off `getTypography`
 * stays on the root theme so `/` without the flag keeps today's sizes.
 */
export function getGreenhouseTypographyOverrides(): TypographyVariantsOptions {
  return {
    body1: {
      fontSize: GREENHOUSE_TYPE_SCALE.body1,
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: GREENHOUSE_TYPE_SCALE.body2,
      letterSpacing: '0.01em',
      lineHeight: 1.45,
    },
    button: {
      fontSize: GREENHOUSE_TYPE_SCALE.body2,
      fontWeight: 600,
      letterSpacing: '0.01em',
      lineHeight: 1.3,
    },
    caption: {
      fontSize: GREENHOUSE_TYPE_SCALE.caption,
      fontStretch: 'normal',
      fontWeight: 500,
      letterSpacing: '0.02em',
      lineHeight: 1.35,
    },
    display: {
      fontFamily: FONT_DISPLAY_STACK,
      fontSize: GREENHOUSE_TYPE_SCALE.h1,
      fontStretch: 'normal',
      fontVariant: 'normal',
      fontWeight: 500,
      letterSpacing: '-0.03em',
      lineHeight: 1.05,
    },
    h1: {
      fontFamily: FONT_DISPLAY_STACK,
      fontSize: GREENHOUSE_TYPE_SCALE.h1,
      fontStretch: 'normal',
      fontVariant: 'normal',
      fontWeight: 500,
      letterSpacing: '-0.03em',
      lineHeight: 1.05,
    },
    h2: {
      fontSize: GREENHOUSE_TYPE_SCALE.h2,
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    h3: {
      fontSize: GREENHOUSE_TYPE_SCALE.h3,
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h4: {
      fontSize: GREENHOUSE_TYPE_SCALE.h4,
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.25,
    },
    h5: {
      fontSize: GREENHOUSE_TYPE_SCALE.h5,
      fontStretch: 'normal',
      fontWeight: 400,
      letterSpacing: '0.01em',
      lineHeight: 1.35,
      opacity: 0.8,
    },
    h6: {
      fontSize: GREENHOUSE_TYPE_SCALE.h6,
      fontWeight: 500,
      letterSpacing: '0.01em',
      lineHeight: 1.3,
    },
    overline: {
      fontSize: GREENHOUSE_TYPE_SCALE.overline,
      fontStretch: 'expanded',
      fontVariant: 'all-small-caps',
      fontWeight: 600,
      letterSpacing: '0.12em',
      lineHeight: 1.3,
      opacity: 0.7,
    },
  };
}

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
