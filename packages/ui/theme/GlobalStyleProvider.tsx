'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { getTheme } from '.';

/**
 * Created just once per app lifecycle
 */
const theme = getTheme();

/**
 * Applies theming + reset + other global styles to the full app
 */
export function GlobalStyleProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="system" disableTransitionOnChange={true} theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
