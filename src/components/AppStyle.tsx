import '@picocss/pico/css/pico.min.css';
import { createGlobalStyle } from 'styled-components';

const CONTENT_GRID_DIMENSION = 12;
const CONTENT_GRID_GAP = 1;

/**
 * Applies styles to the full app
 */
const AppStyle = createGlobalStyle`
  :root {
      /* These are Pico overrides */
      --border-radius: 1rem;
      
      /* Below here are new variables */
      --content-grid-dimension: ${CONTENT_GRID_DIMENSION};
      --content-grid-dimension-em: ${CONTENT_GRID_DIMENSION}em;
      --content-grid-gap: ${CONTENT_GRID_GAP};
      --content-grid-gap-em: ${CONTENT_GRID_GAP}em;
  }
`;

export default AppStyle;
