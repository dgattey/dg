import '@picocss/pico/css/pico.min.css';
import { createGlobalStyle } from 'styled-components';

const CONTENT_GRID_DIMENSION = 17;
const CONTENT_GRID_GAP = 2.5;

/**
 * Creates a card size in em from a span
 */
export const cardSizeInEm = (span = 1) =>
  CONTENT_GRID_DIMENSION * span + (span - 1) * CONTENT_GRID_GAP;

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
`;

export default AppStyle;
