export type ColorSchemePreference = 'light' | 'dark' | 'system';

export type ColorSchemeDeclaration = 'light' | 'dark' | 'light dark';

export const COLOR_SCHEME_STORAGE_KEY = 'color-scheme';
export const COLOR_SCHEME_ATTRIBUTE = 'data-color-scheme';
export const DEFAULT_COLOR_SCHEME_PREFERENCE = 'system' satisfies ColorSchemePreference;
export const SYSTEM_COLOR_SCHEME_STYLE = { colorScheme: 'light dark' } as const;

export function colorSchemeDeclaration(preference: ColorSchemePreference): ColorSchemeDeclaration {
  switch (preference) {
    case 'dark':
      return 'dark';
    case 'light':
      return 'light';
    case 'system':
      return 'light dark';
    default: {
      const unhandledPreference: never = preference;
      return unhandledPreference;
    }
  }
}

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
