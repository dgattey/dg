import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import useLocalStorageValue from './useLocalStorageValue';

/**
 * The color scheme the system prefers by default
 */
export type ColorScheme = 'dark' | 'light';

/**
 * Function to update a nullable color scheme
 */
export type SetColorScheme = (value: ColorScheme | null) => void;

// Name of the attribute for theme we add on `html`
const THEME_ATTRIBUTE = 'data-theme';

// If this is true, we disable animations
export const ANIMATE_ATTRIBUTE = 'data-animations-enabled';

// The media query we'd like to match
const PREFERS_DARK = '(prefers-color-scheme: dark)';

/**
 * Generates a media event listener for `PREFERS_DARK` for use inside a `useEffect`
 */
const generateMediaEventListener = (
  setSystemScheme: Dispatch<SetStateAction<ColorScheme | null>>,
) => {
  if (!window) {
    return;
  }
  const prefersDark = window.matchMedia(PREFERS_DARK);
  setSystemScheme(prefersDark.matches ? 'dark' : 'light');

  const listener = (event: MediaQueryListEvent) =>
    setSystemScheme(event.matches ? 'dark' : 'light');
  prefersDark.addEventListener('change', listener);
  return () => {
    prefersDark.removeEventListener('change', listener);
  };
};

/**
 * Modifies the document's `data-theme` attribute to change the theme itself.
 * Also disables animations around it, so colors don't animate their change.
 * Only the color scheme switcher should be an exception to that.
 */
const updateThemeAttribute = (scheme: ColorScheme, isSystemScheme: boolean) => {
  const htmlElement = document.documentElement;
  htmlElement.setAttribute(ANIMATE_ATTRIBUTE, 'false');
  if (isSystemScheme) {
    htmlElement.removeAttribute(THEME_ATTRIBUTE);
  } else {
    htmlElement.setAttribute(THEME_ATTRIBUTE, scheme);
  }

  // Make sure to turn on animations non-synchronously
  const id = requestAnimationFrame(() => htmlElement.setAttribute(ANIMATE_ATTRIBUTE, 'true'));
  return () => cancelAnimationFrame(id);
};

/**
 * Hook to fetch the current color scheme based both off a value saved by the
 * user (optional) or the value of the `prefers-color-scheme` media query. For
 * prerendering, it defaults the color scheme to light + using the system
 * scheme. May result in bugs if Javascript is off + the values of
 * `colorScheme`/`isSystemScheme` are used for prerendered data, as locally,
 * the page will still reflect the system color but anything using this JS
 * is artifically defaulted to light.
 *
 * IMPORTANT: must be called only once to allow proper changing - otherwise
 * the changes are component-level. Pair with ColorSchemeContext for best
 * results.
 */
const useColorScheme = () => {
  // The value of these will be different on server vs client - don't use outside a `useEffect`
  const [preferredScheme, changeScheme, deleteScheme] = useLocalStorageValue<ColorScheme | null>(
    'colorScheme',
    null,
  );
  const [systemScheme, setSystemScheme] = useState<ColorScheme | null>(null);

  // These values are set in a `useEffect` and can be used for prerendered content safely
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [isSystemScheme, setIsSystemScheme] = useState(true);

  // Set our locally-rendered values during client hydration
  useEffect(() => {
    setColorScheme(preferredScheme ?? systemScheme ?? 'light');
    setIsSystemScheme(preferredScheme === null);
  }, [setColorScheme, systemScheme, preferredScheme]);

  // Modifies data-theme attribute for the page based on current theme & listens to `prefers-color-scheme` changes
  useEffect(() => updateThemeAttribute(colorScheme, isSystemScheme), [colorScheme, isSystemScheme]);
  useEffect(() => generateMediaEventListener(setSystemScheme), []);

  // The update here actually changes or deletes the local storage value for cleanup
  return {
    colorScheme,
    isSystemScheme,
    isInitializedWithSystemScheme: systemScheme !== null,
    updatePreferredScheme: (value: ColorScheme | null) =>
      value ? changeScheme(value) : deleteScheme(),
  } as const;
};

export default useColorScheme;
