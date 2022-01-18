import '@picocss/pico/css/pico.min.css';
import { ANIMATE_ATTRIBUTE } from 'hooks/useColorScheme';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createGlobalStyle, css } from 'styled-components';

/**
 * Variables specific to dark mode. Anything that appears here needs to have
 * something defined in `lightModeVariables` and vice versa.
 */
const darkModeVariables = css`
  --contrast-overlay: var(--contrast-inverse);
  --contrast-overlay-inverse: var(--contrast);

  // Same as --card-box-shadow with the fade doubled
  --card-hovered-box-shadow: 0 0.125rem 2rem rgba(0, 0, 0, 0.06),
    0 0.125rem 4rem rgba(0, 0, 0, 0.12), 0 0 0 0.125rem rgba(0, 0, 0, 0.036);

  --yellow: yellow;
  --navy: #0a6280;
`;

/**
 * Variables specific to light mode. Anything that appears here needs to have
 * something defined in `darkModeVariables` and vice versa.
 */
const lightModeVariables = css`
  --contrast-overlay: var(--secondary);
  --contrast-overlay-inverse: var(--secondary-inverse);

  // Same as --card-box-shadow with the fade doubled
  --card-hovered-box-shadow: 0 0.125rem 2rem rgba(27, 40, 50, 0.04),
    0 0.125rem 4rem rgba(27, 40, 50, 0.08), 0 0 0 0.125rem rgba(27, 40, 50, 0.024);

  --yellow: rgb(222, 197, 29);
  --navy: #0a6280;
`;

/**
 * Applies styles to the full app
 */
const AppStyle = createGlobalStyle`
  :root {
      /* These are Pico overrides */
      --border-radius: 3em;

      /* We disable all transitions when changing color schemes, except if this is used */
      --transition-always-enabled: 0.2s ease-in-out;

      /* Used for small buttons/etc */
      --font-size-small: 0.8rem;
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

  // Disable all animations if this is true
  :root[${ANIMATE_ATTRIBUTE}='false'] {
    --transition: 0s;
  }
`;

export default AppStyle;
