import '@picocss/pico/css/pico.min.css';
import { createGlobalStyle, css } from 'styled-components';

const CONTENT_GRID_DIMENSION = 17;
const CONTENT_GRID_GAP = 2.5;

/**
 * Creates a card size in em from a span
 */
export const cardSizeInEm = (span = 1) =>
  CONTENT_GRID_DIMENSION * span + (span - 1) * CONTENT_GRID_GAP;

/**
 * Variables specific to dark mode. Anything that appears here needs to have
 * something defined in `lightModeVariables` and vice versa.
 */
const darkModeVariables = css`
  --contrast-overlay: var(--contrast-inverse);
  --contrast-overlay-inverse: var(--contrast);
`;

/**
 * Variables specific to light mode. Anything that appears here needs to have
 * something defined in `darkModeVariables` and vice versa.
 */
const lightModeVariables = css`
  --contrast-overlay: var(--secondary);
  --contrast-overlay-inverse: var(--secondary-inverse);
`;

/**
 * Applies styles to the full app
 */
const AppStyle = createGlobalStyle`
  :root {
      /* These are Pico overrides */
      --border-radius: 1rem;
      
      /* Below here are new variables */
      --content-grid-dimension-em: ${CONTENT_GRID_DIMENSION}em;
      --content-grid-gap-em: ${CONTENT_GRID_GAP}em;
  }

  // When a page/component is set to light or the root has no dark theme applied
  [data-theme='light'],
  :root:not([data-theme='dark']) {
    ${lightModeVariables};
  }

  // When a page/component is set to dark
  [data-theme='dark'] {
    ${darkModeVariables};
  }

  // When dark mode is on and the root isn't set to light
  @media only screen and (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      ${darkModeVariables};
    }
  }
`;

export default AppStyle;
