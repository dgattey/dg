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

// The media query we'd like to match
const PREFERS_DARK = '(prefers-color-scheme: dark)';

/**
 * Hook to fetch the current color scheme based both off a value saved by the
 * user (optional) or the value of the `prefers-color-scheme` media query. For
 * prerendering, it defaults the color scheme to light + using the system
 * scheme. May result in bugs if Javascript is off + the values of
 * `colorScheme`/`isSystemScheme` are used for prerendered data, as locally,
 * the page will still reflect the system color but anything using this JS
 * is artifically defaulted to light.
 */
const useColorScheme = () => {
  // The value of these will be different on server vs client - don't use outside a `useEffect`
  const [preferredScheme, updatePreferredScheme, deletePreferredScheme] =
    useLocalStorageValue<ColorScheme | null>('colorScheme', null);
  const updateOrDeletePreferredScheme: SetColorScheme = (value) =>
    value ? updatePreferredScheme(value) : deletePreferredScheme();
  const [systemScheme, setSystemScheme] = useState<ColorScheme | null>(null);

  // These values are set in a `useEffect` and can be used for prerendered content safely
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const [isSystemScheme, setIsSystemScheme] = useState(true);

  // Set our locally-rendered values during client hydration
  useEffect(() => {
    setColorScheme(preferredScheme ?? systemScheme ?? 'light');
    setIsSystemScheme(preferredScheme === null);
  }, [setColorScheme, systemScheme, preferredScheme]);

  // Adds an attribute on the html element for the page based on current theme
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isSystemScheme) {
      htmlElement.removeAttribute(THEME_ATTRIBUTE);
      return;
    }
    document.documentElement.setAttribute(THEME_ATTRIBUTE, colorScheme);
  }, [colorScheme, isSystemScheme]);

  // Setup event listenter for later changes + set the initial value from `prefers-color-scheme`
  useEffect(() => {
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
  }, []);

  // The update here actually updates or deletes the local storage value for cleanup
  return {
    colorScheme,
    isSystemScheme,
    isInitializedWithSystemScheme: systemScheme !== null,
    updatePreferredScheme: updateOrDeletePreferredScheme,
  } as const;
};

export default useColorScheme;
