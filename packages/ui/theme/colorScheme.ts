export type ColorSchemePreference = 'light' | 'dark' | 'system';

export const COLOR_SCHEME_STORAGE_KEY = 'color-scheme';
/** Key MUI's own toggle used before this app owned the preference. */
export const COLOR_SCHEME_LEGACY_STORAGE_KEY = 'mui-mode';
export const COLOR_SCHEME_ATTRIBUTE = 'data-color-scheme';
export const DEFAULT_COLOR_SCHEME_PREFERENCE = 'system' satisfies ColorSchemePreference;

/**
 * Body of the blocking `<head>` script that applies a stored preference before
 * the first paint. Built from the constants above so the two can never drift,
 * and inlined rather than fetched so no round trip gates the first paint.
 */
export const COLOR_SCHEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem(${JSON.stringify(COLOR_SCHEME_STORAGE_KEY)})||localStorage.getItem(${JSON.stringify(COLOR_SCHEME_LEGACY_STORAGE_KEY)});if(p!=="light"&&p!=="dark"){return}document.documentElement.setAttribute(${JSON.stringify(COLOR_SCHEME_ATTRIBUTE)},p)}catch(e){}})()`;

export function parseColorSchemePreference(raw: string | null | undefined): ColorSchemePreference {
  switch (raw) {
    case 'dark':
      return 'dark';
    case 'light':
      return 'light';
    case 'system':
      return 'system';
    default:
      return DEFAULT_COLOR_SCHEME_PREFERENCE;
  }
}

/**
 * The stored preference is the only source of truth. The `<html>` attribute is
 * derived from it, and React erases that attribute whenever it hydrates, so
 * reading the DOM back would report `system` for everyone.
 */
export function readStoredColorSchemePreference(): ColorSchemePreference {
  try {
    return parseColorSchemePreference(
      localStorage.getItem(COLOR_SCHEME_STORAGE_KEY) ??
        localStorage.getItem(COLOR_SCHEME_LEGACY_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_COLOR_SCHEME_PREFERENCE;
  }
}

/**
 * Drives the scheme through the attribute alone. `color-scheme` itself lives in
 * the theme's global styles, keyed off this attribute — writing it inline here
 * instead would beat those rules and survive nothing, since React owns
 * `<html>`'s style attribute and resets it on hydration.
 */
export function applyColorSchemePreference(preference: ColorSchemePreference) {
  const root = document.documentElement;

  if (preference === DEFAULT_COLOR_SCHEME_PREFERENCE) {
    root.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
    return;
  }
  if (root.getAttribute(COLOR_SCHEME_ATTRIBUTE) !== preference) {
    root.setAttribute(COLOR_SCHEME_ATTRIBUTE, preference);
  }
}
