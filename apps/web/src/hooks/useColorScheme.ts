import { useEffect, useState } from 'react';
import { PaletteMode } from '@mui/material';
import { useColorScheme as useMuiColorScheme } from '@mui/material/styles';

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
  colorScheme: { mode: ColorSchemeMode; isCustomized: boolean; isInitialized: boolean };
  updatePreferredMode: SetColorScheme;
}> {
  const { mode, setMode, systemMode } = useMuiColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const [isInitialized, setIsInitialized] = useState(false);

  // Make sure we set initialized before we try to render
  useEffect(() => setIsInitialized(true), []);

  return {
    colorScheme: {
      mode: resolvedMode ?? 'light',
      isCustomized: isInitialized && mode !== 'system',
      isInitialized,
    },
    updatePreferredMode: setMode,
  } as const;
}
