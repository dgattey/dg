import { EASING_EASE_OUT, getTimingCssVars, TIMING_FAST } from '../helpers/timing';
import { BRAND, onCanvas } from './color';
import { COLOR_SCHEME_ATTRIBUTE } from './colorScheme';
import { getTypography } from './typography';

const CARD_SHADOW_MAIN = '0 1.5px 0 rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)';
const CARD_SHADOW_HOVERED = '0 3px 0 rgba(0, 0, 0, 0.22), 0 0 0 1.5px rgba(0, 0, 0, 0.06)';

const createTooltipTransitionDecl = (isRevealed: boolean) =>
  [
    `opacity ${TIMING_FAST}ms ${EASING_EASE_OUT} ${isRevealed ? 0 : TIMING_FAST}ms`,
    `visibility 0s linear ${isRevealed ? 0 : TIMING_FAST * 2}ms`,
  ].join(', ');

function cssLength(value: number | string | undefined): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value ?? '';
}

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
:where([data-typography]) { font-family: var(--font-sans); margin: 0; text-rendering: optimizeLegibility; }
:where([data-typography="body1"]) { color: var(--dg-palette-text-primary); font-size: 1.03125rem; font-weight: 400; line-height: 1.5; }
:where([data-typography="body2"]) { color: var(--dg-palette-text-secondary); font-size: 1.03125rem; font-weight: 400; line-height: 1.43; }
:where([data-typography="button"]) { font-size: ${cssLength(typography.button.fontSize)}; font-weight: ${typography.button.fontWeight}; line-height: 1.75; }
:where([data-typography="caption"]) { font-size: ${cssLength(typography.caption.fontSize)}; font-weight: ${typography.caption.fontWeight}; line-height: 1.66; }
:where([data-typography="code"]) { background: var(--dg-palette-background-paper); border-radius: ${typography.code.borderRadius}; color: var(--dg-palette-text-secondary); font-family: var(--font-mono); font-size: ${cssLength(typography.code.fontSize)}; line-height: ${typography.code.lineHeight}; padding: ${typography.code.padding}; }
:where([data-typography="h1"]) { color: var(--dg-palette-text-h1); font-size: ${cssLength(typography.h1.fontSize)}; font-variant: ${typography.h1.fontVariant}; font-weight: ${typography.h1.fontWeight}; line-height: 1.167; }
:where([data-typography="h2"]) { color: var(--dg-palette-text-h2); font-size: ${cssLength(typography.h2.fontSize)}; font-weight: ${typography.h2.fontWeight}; line-height: 1.2; }
:where([data-typography="h3"]) { color: var(--dg-palette-text-h3); font-size: ${cssLength(typography.h3.fontSize)}; font-weight: ${typography.h3.fontWeight}; line-height: 1.167; }
:where([data-typography="h4"]) { color: var(--dg-palette-text-h4); font-size: 1.140625rem; font-weight: ${typography.h4.fontWeight}; line-height: 1.235; }
:where([data-typography="h5"]) { color: var(--dg-palette-text-h5); font-size: 1.015625rem; font-weight: ${typography.h5.fontWeight}; line-height: 1.334; }
:where([data-typography="h6"]) { color: var(--dg-palette-text-h6); font-size: ${cssLength(typography.h6.fontSize)}; font-weight: ${typography.h6.fontWeight}; line-height: 1.6; }
:where([data-typography="overline"]) { font-size: ${cssLength(typography.overline.fontSize)}; font-weight: ${typography.overline.fontWeight}; line-height: 1.25; }
@media (min-width: 576px) {
  :where([data-typography="body1"]) { font-size: 1rem; }
  :where([data-typography="body2"]) { font-size: 1.049rem; }
  :where([data-typography="h4"]) { font-size: 1.2146rem; }
  :where([data-typography="h5"]) { font-size: 0.937rem; }
}
@media (min-width: 992px) {
  :where([data-typography="body1"]), :where([data-typography="body2"]) { font-size: 1.0625rem; }
  :where([data-typography="h4"]) { font-size: 1.2813rem; }
  :where([data-typography="h5"]) { font-size: 1.0313rem; }
}
:where([data-ui-link]) {
  color: inherit;
  cursor: pointer;
  text-decoration: none;
}
:where([data-ui-link]:hover) {
  text-decoration: underline;
}
:where([data-ui-link-wrapper]) {
  color: inherit;
  text-decoration: none;
}
:where([data-typography][data-has-color]) {
  color: var(--typography-color);
}
:where([data-cursor-icon]) {
  display: inline-flex;
  height: var(--cursor-icon-size, 1em);
  width: var(--cursor-icon-size, 1em);
}
:where([data-fa-icon]) {
  display: inline-flex;
  height: var(--fa-icon-size, 1em);
  width: var(--fa-icon-size, 1em);
}
:where([data-fa-icon] > svg) {
  display: inline-block;
  height: var(--fa-icon-size, 1em);
  overflow: visible;
  vertical-align: -0.125em;
  width: var(--fa-icon-size, 1em);
}
:where([data-ui-image="aspect"]) {
  aspect-ratio: var(--img-aspect-ratio);
  border-style: none;
  display: flex;
  height: auto;
  max-width: 100%;
  object-fit: cover;
}
:where([data-ui-image="cover"]), :where([data-ui-image="fill-compact"]) {
  border-style: none;
  height: 100%;
  object-fit: cover;
  object-position: center;
  width: 100%;
}
:where([data-ui-image="fill-compact"]) {
  inset: 0;
  position: absolute;
}
:where([data-rich-text]) {
  display: flex;
  flex-direction: column;
}
:where([data-rich-heading]) {
  margin-bottom: 24px;
  scroll-margin-top: 136px;
}
:where([data-rich-paragraph]) {
  margin-bottom: 28px;
}
:where([data-rich-divider]) {
  border-color: var(--dg-palette-divider);
  border-style: solid;
  border-width: 0 0 thin 0;
  flex-shrink: 0;
  margin: 0;
}
:where([data-skeleton]) {
  animation: dg-pulse 2s ease-in-out 0.5s infinite;
  background-color: var(--dg-skeleton-bg, rgba(128, 128, 128, 0.12));
  border-radius: 4px;
  display: block;
  height: var(--skeleton-h, 1.2em);
  width: var(--skeleton-w, auto);
}
:where([data-skeleton="rounded"]) {
  border-radius: 8px;
  height: var(--skeleton-h, auto);
}
[data-tooltip-anchor] {
  anchor-name: var(--tooltip-anchor);
  display: inline-flex;
}
@supports not (position-area: block-end) {
  [data-tooltip-anchor] {
    position: relative;
  }
}
[data-tooltip-anchor][data-tooltip-truncated] {
  display: flex;
  max-width: 100%;
  min-width: 0;
}
[data-tooltip-anchor][data-tooltip-truncated] > :not([role="tooltip"]) {
  min-width: 0;
}
:where([data-tooltip-surface], [data-tooltip-portal]) {
  background: var(--dg-palette-background-paper);
  border: thin solid var(--dg-palette-card-border);
  border-radius: 12px;
  box-shadow: var(--dg-shadow-card-main);
  color: var(--dg-palette-text-primary);
  font-variant-caps: normal;
  font-weight: 600;
  letter-spacing: normal;
  line-height: 1.3;
  padding: 6px 12px;
  pointer-events: none;
  text-transform: none;
}
[data-tooltip-surface] {
  justify-self: unsafe anchor-center;
  opacity: 0;
  position: fixed;
  position-anchor: var(--tooltip-anchor);
  position-try-fallbacks: flip-block;
  transition: ${createTooltipTransitionDecl(false)};
  visibility: hidden;
  white-space: nowrap;
  z-index: 1500;
}
[data-tooltip-portal] {
  left: 0;
  max-width: min(420px, calc(100vw - 24px));
  overflow-wrap: break-word;
  position: fixed;
  top: 0;
  white-space: normal;
  width: max-content;
  z-index: 9999;
}
[data-tooltip-surface][data-tooltip-no-flip] {
  position-try-fallbacks: none;
}
[data-tooltip-surface][data-placement="bottom"] {
  align-self: unsafe start;
  margin-block-end: 0;
  margin-block-start: 8px;
  position-area: block-end;
}
[data-tooltip-surface][data-placement="top"] {
  align-self: unsafe end;
  margin-block-end: 8px;
  margin-block-start: 0;
  position-area: block-start;
}
@supports not (position-area: block-end) {
  [data-tooltip-surface] {
    left: 50%;
    position: absolute;
    transform: translateX(-50%);
  }
  [data-tooltip-surface][data-placement="bottom"] {
    bottom: auto;
    top: 100%;
  }
  [data-tooltip-surface][data-placement="top"] {
    bottom: 100%;
    top: auto;
  }
}
[data-tooltip-anchor]:hover > [data-tooltip-surface],
:focus-visible>[data-tooltip-anchor]>[data-tooltip-surface],
[data-tooltip-anchor]:has(:focus-visible) > [data-tooltip-surface] {
  opacity: 1;
  pointer-events: auto;
  transition: ${createTooltipTransitionDecl(true)};
  visibility: visible;
}
[data-tooltip-muted] > [data-tooltip-surface],
[data-tooltip-floating] > [data-tooltip-surface] {
  display: none;
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
