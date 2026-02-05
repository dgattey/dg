'use client';

import type { PaletteMode } from '@mui/material';
import { useColorScheme as useMuiColorScheme } from '@mui/material/styles';
import { useEffect } from 'react';
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

  useEffect(() => {
    const value = isSystemMode ? 'system' : effectiveMode;
    if (!value) {
      return;
    }
    // biome-ignore lint/suspicious/noDocumentCookie: Client-side theme persistence requires document.cookie
    document.cookie = `${themeCookieName}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, [effectiveMode, isSystemMode]);

  return {
    colorScheme: {
      isCustomized: !isSystemMode,
      isInitialized: true,
      mode: effectiveMode ?? 'light',
    },
    updatePreferredMode: setMode,
  } as const;
}
