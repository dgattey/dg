import type { CSSProperties } from 'react';
import { getTimingCssVars } from '../helpers/timing';
import { onCanvas } from './color';
import { COLOR_SCHEME_ATTRIBUTE } from './colorScheme';
import { getShadows } from './extraShadows';
import { getPalette } from './palette';
import { getShape } from './shape';
import { getTypography } from './typography';

export type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

type SxProperties = {
  [K in keyof CSSProperties]?: ResponsiveValue<CSSProperties[K]>;
};

/**
 * Single style object supporting CSS properties, CSS custom properties,
 * responsive breakpoint values (`{ xs, sm, md, lg, xl }`), and nested selectors.
 */
export type SxObject = SxProperties & {
  [key: string]: unknown;
};

export type SxElement = SxObject;

export type SxProps = SxObject | boolean | null | undefined | ReadonlyArray<SxProps>;

export function getGlobalThemeCss(): string {
  const palette = getPalette();
  const shadows = getShadows();
  const shape = getShape();
  const typography = getTypography();
  const timingVars = getTimingCssVars();

  const timingDeclarations = Object.entries(timingVars)
    .map(([key, val]) => `${key}: ${val};`)
    .join('\n  ');

  return `
:root {
  ${timingDeclarations}
  --mui-palette-common-black: #000;
  --mui-palette-common-white: #fff;
  --mui-palette-background-default: ${palette.background.default};
  --mui-palette-background-paper: ${palette.background.paper};
  --mui-palette-text-primary: ${palette.text.primary};
  --mui-palette-text-secondary: ${palette.text.secondary};
  --mui-palette-text-disabled: ${palette.text.disabled};
  --mui-palette-text-h1: ${palette.text.h1};
  --mui-palette-text-h2: ${palette.text.h2};
  --mui-palette-text-h3: ${palette.text.h3};
  --mui-palette-text-h4: ${palette.text.h4};
  --mui-palette-text-h5: ${palette.text.h5};
  --mui-palette-text-h6: ${palette.text.h6};
  --mui-palette-primary-main: ${palette.primary.main};
  --mui-palette-primary-light: ${palette.primary.light};
  --mui-palette-primary-dark: ${palette.primary.dark};
  --mui-palette-primary-contrastText: ${palette.primary.contrastText};
  --mui-palette-secondary-main: ${palette.secondary.main};
  --mui-palette-secondary-light: ${palette.secondary.light};
  --mui-palette-secondary-dark: ${palette.secondary.dark};
  --mui-palette-secondary-contrastText: ${palette.secondary.contrastText};
  --mui-palette-error-main: ${palette.error.main};
  --mui-palette-error-light: ${palette.error.light};
  --mui-palette-error-dark: ${palette.error.dark};
  --mui-palette-error-contrastText: ${palette.error.contrastText};
  --mui-palette-warning-main: ${palette.warning.main};
  --mui-palette-warning-light: ${palette.warning.light};
  --mui-palette-warning-dark: ${palette.warning.dark};
  --mui-palette-warning-contrastText: ${palette.warning.contrastText};
  --mui-palette-info-main: ${palette.info.main};
  --mui-palette-info-light: ${palette.info.light};
  --mui-palette-info-dark: ${palette.info.dark};
  --mui-palette-info-contrastText: ${palette.info.contrastText};
  --mui-palette-success-main: ${palette.success.main};
  --mui-palette-success-light: ${palette.success.light};
  --mui-palette-success-dark: ${palette.success.dark};
  --mui-palette-success-contrastText: ${palette.success.contrastText};
  --mui-palette-card-border: ${palette.card.border};
  --mui-palette-divider: ${palette.divider};
  --mui-palette-action-active: ${palette.action.active};
  --mui-palette-action-hover: ${palette.action.hover};
  --mui-palette-action-selected: ${palette.action.selected};
  --mui-palette-action-disabled: ${palette.action.disabled};
  --mui-palette-action-disabledBackground: ${palette.action.disabledBackground};
  --mui-palette-action-focus: ${palette.action.focus};
  --mui-extraShadows-card-main: ${shadows.card.main};
  --mui-extraShadows-card-hovered: ${shadows.card.hovered};
  --mui-extraShadows-card-overlayHovered: ${shadows.card.overlayHovered};
  --mui-extraShadows-map-control: ${shadows.map.control};
  --mui-shape-borderRadius: 4px;
  --mui-shape-cardBorderRadius: ${shape.cardBorderRadius}px;
  --dg-skeleton-bg: ${onCanvas(12)};
  --font-sans: ${typography.fontFamily};
  font-size: 15px;
  font-variant: tabular-nums;
  word-break: break-word;
}
@media (min-width: 576px) { :root { font-size: 16px; } }
@media (min-width: 768px) { :root { font-size: 17px; } }
@media (min-width: 992px) { :root { font-size: 18px; } }
@media (min-width: 1200px) { :root { font-size: 19px; } }

*, *::before, *::after {
  box-sizing: border-box;
}
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color-scheme: light dark;
  scrollbar-gutter: stable;
  text-size-adjust: 100%;
  text-wrap: pretty;
}
html[${COLOR_SCHEME_ATTRIBUTE}="dark"] {
  color-scheme: dark;
}
html[${COLOR_SCHEME_ATTRIBUTE}="light"] {
  color-scheme: light;
}
html, body {
  overflow-x: clip;
  width: 100%;
}
body {
  background-color: var(--mui-palette-background-default);
  color: var(--mui-palette-text-primary);
  font-family: ${typography.fontFamily};
  font-size: 1.03125rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  overscroll-behavior-x: none;
}
@media (min-width: 576px) { body { font-size: 1rem; } }
@media (min-width: 992px) { body { font-size: 1.0625rem; } }
h1, h2, h3, h4 {
  text-wrap: balance;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
@keyframes dg-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
@keyframes dg-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
}
