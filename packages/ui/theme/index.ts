import { getTimingCssVars } from '../helpers/timing';
import { BRAND, onCanvas } from './color';
import { COLOR_SCHEME_ATTRIBUTE } from './colorScheme';
import { getTypography } from './typography';

const CARD_SHADOW_MAIN = '0 1.5px 0 rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)';
const CARD_SHADOW_HOVERED = '0 3px 0 rgba(0, 0, 0, 0.22), 0 0 0 1.5px rgba(0, 0, 0, 0.06)';

export function getGlobalThemeCss(): string {
  const typography = getTypography();
  const timingVars = getTimingCssVars();

  const timingDeclarations = Object.entries(timingVars)
    .map(([key, val]) => `${key}: ${val};`)
    .join('\n  ');

  return `
:root {
  ${timingDeclarations}
  --dg-palette-common-black: #000;
  --dg-palette-common-white: #fff;
  --dg-palette-background-default: ${BRAND.defaultBackground};
  --dg-palette-background-paper: ${BRAND.paperBackground};
  --dg-palette-text-primary: ${BRAND.text};
  --dg-palette-text-secondary: ${BRAND.mutedText};
  --dg-palette-text-h1: ${BRAND.h1};
  --dg-palette-text-h2: ${BRAND.h2};
  --dg-palette-text-h3: ${BRAND.h3};
  --dg-palette-text-h4: ${BRAND.h4};
  --dg-palette-text-h5: ${BRAND.h5};
  --dg-palette-text-h6: ${BRAND.h6};
  --dg-palette-card-border: ${BRAND.cardBorder};
  --dg-palette-divider: ${onCanvas(12)};
  --dg-shadow-card-main: ${CARD_SHADOW_MAIN};
  --dg-shadow-card-hovered: ${CARD_SHADOW_HOVERED};
  --dg-skeleton-bg: ${onCanvas(12)};
  --font-sans: ${typography.fontFamily};
  --font-mono: ${typography.code.fontFamily};
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
  background-color: var(--dg-palette-background-default);
  color: var(--dg-palette-text-primary);
  font-family: var(--font-sans);
  font-size: 1.03125rem;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
  overscroll-behavior-x: none;
}
button, input, select, textarea {
  font: inherit;
  letter-spacing: inherit;
}
b, strong {
  font-weight: 700;
}
code, kbd, pre, samp {
  font-family: var(--font-mono);
}
@media (min-width: 576px) { body { font-size: 1rem; } }
@media (min-width: 992px) { body { font-size: 1.0625rem; } }
h1, h2, h3, h4 {
  text-wrap: balance;
}
[data-typography] {
  font-family: var(--font-sans);
  margin: 0;
  text-rendering: optimizeLegibility;
}
[data-typography="body1"] {
  color: var(--dg-palette-text-primary);
  font-size: 1.03125rem;
  font-weight: 400;
  line-height: 1.5;
}
[data-typography="body2"] {
  color: var(--dg-palette-text-secondary);
  font-size: 1.03125rem;
  font-weight: 400;
  line-height: 1.43;
}
[data-typography="button"] {
  font-size: ${typography.button.fontSize};
  font-weight: ${typography.button.fontWeight};
  letter-spacing: ${typography.button.letterSpacing};
  line-height: 1.75;
  text-transform: ${typography.button.textTransform};
}
[data-typography="caption"] {
  font-size: ${typography.caption.fontSize};
  font-weight: ${typography.caption.fontWeight};
  line-height: 1.66;
}
[data-typography="code"] {
  background: var(--dg-palette-background-paper);
  border-radius: ${typography.code.borderRadius};
  color: var(--dg-palette-text-secondary);
  font-family: var(--font-mono);
  font-size: ${typography.code.fontSize};
  font-weight: ${typography.code.fontWeight};
  padding: ${typography.code.padding};
}
[data-typography="h1"] {
  color: var(--dg-palette-text-h1);
  font-size: ${typography.h1.fontSize};
  font-weight: ${typography.h1.fontWeight};
  letter-spacing: ${typography.h1.letterSpacing};
  line-height: 1.167;
}
[data-typography="h2"] {
  color: var(--dg-palette-text-h2);
  font-size: ${typography.h2.fontSize};
  font-weight: ${typography.h2.fontWeight};
  letter-spacing: ${typography.h2.letterSpacing};
  line-height: 1.2;
}
[data-typography="h3"] {
  color: var(--dg-palette-text-h3);
  font-size: ${typography.h3.fontSize};
  font-weight: ${typography.h3.fontWeight};
  line-height: 1.167;
}
[data-typography="h4"] {
  color: var(--dg-palette-text-h4);
  font-size: 1.140625rem;
  font-weight: ${typography.h4.fontWeight};
  line-height: 1.235;
}
[data-typography="h5"] {
  color: var(--dg-palette-text-h5);
  font-size: 1.015625rem;
  font-weight: ${typography.h5.fontWeight};
  line-height: 1.334;
}
[data-typography="h6"] {
  color: var(--dg-palette-text-h6);
  font-size: ${typography.h6.fontSize};
  font-weight: ${typography.h6.fontWeight};
  line-height: 1.6;
}
[data-typography="overline"] {
  font-size: ${typography.overline.fontSize};
  font-variant-caps: ${typography.overline.fontVariantCaps};
  font-weight: ${typography.overline.fontWeight};
  letter-spacing: ${typography.overline.letterSpacing};
  line-height: 1.25;
}
@media (min-width: 576px) {
  [data-typography="body1"] { font-size: 1rem; }
  [data-typography="body2"] { font-size: 1.049rem; }
  [data-typography="h4"] { font-size: 1.2146rem; }
  [data-typography="h5"] { font-size: 0.937rem; }
}
@media (min-width: 992px) {
  [data-typography="body1"], [data-typography="body2"] { font-size: 1.0625rem; }
  [data-typography="h4"] { font-size: 1.2813rem; }
  [data-typography="h5"] { font-size: 1.0313rem; }
}
[data-ui-link] {
  color: inherit;
  cursor: pointer;
  text-decoration: none;
}
[data-ui-link]:hover {
  text-decoration: underline;
}
[data-skeleton] {
  animation: dg-pulse 2s ease-in-out 0.5s infinite;
  background-color: var(--dg-skeleton-bg, rgba(128, 128, 128, 0.12));
  display: block;
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
