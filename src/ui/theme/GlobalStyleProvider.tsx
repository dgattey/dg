import CssBaseline from '@mui/material/CssBaseline';
import { ColorSchemeContext } from 'components/ColorSchemeContext';
import { useColorScheme } from 'hooks/useColorScheme';
import { useMemo } from 'react';
import { getTheme } from 'ui/theme';
import { ThemeProvider } from '@mui/material';

/**
 * Applies theming + reset + other global styles to the full app
 */
export function GlobalStyleProvider({ children }: { children: React.ReactNode }) {
  const value = useColorScheme();
  const appliedTheme = useMemo(() => getTheme(value.colorScheme.mode), [value.colorScheme]);

  // Ensure we don't see a flash of light theme, then swap to dark
  if (!value.colorScheme.isInitialized) {
    return null;
  }

  return (
    <ColorSchemeContext.Provider value={value}>
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorSchemeContext.Provider>
  );
}
