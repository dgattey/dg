import '@picocss/pico/css/pico.min.css';
import { createGlobalStyle } from 'styled-components';

/**
 * Applies styles to the full app
 */
const AppStyle = createGlobalStyle`
  :root {
      /* These are Pico overrides */
      --border-radius: 1rem;
  }
`;

export default AppStyle;
