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
  const colorSchemeData = useColorScheme();
  const appliedTheme = useMemo(
    () => getTheme(colorSchemeData.colorScheme.mode),
    [colorSchemeData.colorScheme],
  );

  return (
    <ColorSchemeContext.Provider value={colorSchemeData}>
      <ThemeProvider theme={appliedTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorSchemeContext.Provider>
  );
}
