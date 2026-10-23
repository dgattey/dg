import type { CSSProperties } from 'react';
import { getTimingCssVars } from '../helpers/timing';
import { BRAND, onCanvas } from './color';
import { COLOR_SCHEME_ATTRIBUTE } from './colorScheme';
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

export type SxProps = SxObject | boolean | null | undefined | ReadonlyArray<SxProps>;

const CARD_SHADOW_MAIN =
  '0.0145rem 0.029rem 0.174rem rgba(0,0,0,.017),0.0335rem 0.067rem 0.402rem rgba(0,0,0,.024),0.0625rem 0.125rem 0.75rem rgba(0,0,0,.03),0.1125rem 0.225rem 1.35rem rgba(0,0,0,.036),0.2085rem 0.417rem 2.502rem rgba(0,0,0,.043),0.5rem 1rem 6rem rgba(0,0,0,.06),0 0 0 0.0625rem rgba(0,0,0,.015)';
const CARD_SHADOW_HOVERED =
  '0 0.125rem 2rem rgba(0, 0, 0, 0.06),0 0.125rem 4rem rgba(0, 0, 0, 0.12),0 0 0 0.125rem rgba(0, 0, 0, 0.036)';

export function getGlobalThemeCss(): string {
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
  --mui-palette-background-default: ${BRAND.defaultBackground};
  --mui-palette-background-paper: ${BRAND.paperBackground};
  --mui-palette-text-primary: ${BRAND.text};
  --mui-palette-text-secondary: ${BRAND.mutedText};
  --mui-palette-text-h1: ${BRAND.h1};
  --mui-palette-text-h2: ${BRAND.h2};
  --mui-palette-text-h3: ${BRAND.h3};
  --mui-palette-text-h4: ${BRAND.h4};
  --mui-palette-text-h5: ${BRAND.h5};
  --mui-palette-text-h6: ${BRAND.h6};
  --mui-palette-card-border: ${BRAND.cardBorder};
  --mui-palette-divider: ${onCanvas(12)};
  --mui-extraShadows-card-main: ${CARD_SHADOW_MAIN};
  --mui-extraShadows-card-hovered: ${CARD_SHADOW_HOVERED};
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
`;
}
