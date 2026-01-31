'use client';

import type { PaletteMode } from '@mui/material';
import { useColorScheme as useMuiColorScheme } from '@mui/material/styles';
import { useCallback, useEffect } from 'react';
import { themeCookieName } from '.';

/**
 * The color scheme the system prefers by default
 */
export type ColorSchemeMode = PaletteMode;

/**
 * Function to update a nullable color scheme
 */
export type SetColorScheme = (value: ColorSchemeMode | null) => void;

/**
 * Hook to fetch the current color scheme from MUI and update it
 */
export function useColorScheme(): Readonly<{
  colorScheme: {
    mode: ColorSchemeMode;
    isCustomized: boolean;
    isInitialized: boolean;
  };
  updatePreferredMode: SetColorScheme;
}> {
  const { mode, setMode, systemMode } = useMuiColorScheme();
  const isSystemMode = mode === 'system' || mode === null || typeof mode === 'undefined';
  const resolvedMode = isSystemMode ? systemMode : mode;
  const domTheme =
    typeof document === 'undefined' ? null : document.documentElement.getAttribute('data-theme');
  const domMode = domTheme === 'dark' || domTheme === 'light' ? domTheme : null;
  const effectiveMode = resolvedMode ?? domMode;
  const writeThemeCookie = useCallback((value: string) => {
    const hasCookieStore =
      'cookieStore' in window &&
      typeof (window as Window & { cookieStore?: { set?: unknown } }).cookieStore?.set ===
        'function';
    const cookieStore = hasCookieStore
      ? (
          window as Window & {
            cookieStore: {
              set: (params: { name: string; value: string; path: string; maxAge: number }) => void;
            };
          }
        ).cookieStore
      : null;

    if (cookieStore) {
      void cookieStore.set({
        maxAge: 60 * 60 * 24 * 365,
        name: themeCookieName,
        path: '/',
        value,
      });
      return;
    }
    // biome-ignore lint/suspicious/noDocumentCookie: Legacy fallback for browsers without Cookie Store.
    document.cookie = `${themeCookieName}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);

  useEffect(() => {
    if (isSystemMode) {
      writeThemeCookie('system');
      return;
    }
    if (!effectiveMode) {
      return;
    }
    writeThemeCookie(effectiveMode);
  }, [effectiveMode, isSystemMode, writeThemeCookie]);

  return {
    colorScheme: {
      isCustomized: !isSystemMode,
      isInitialized: true,
      mode: effectiveMode ?? 'light',
    },
    updatePreferredMode: setMode,
  } as const;
}
