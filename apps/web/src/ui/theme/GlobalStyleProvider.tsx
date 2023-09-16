import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from 'ui/theme';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

/**
 * Created just once per app lifecycle
 */
const theme = getTheme();

/**
 * Applies theming + reset + other global styles to the full app
 */
export function GlobalStyleProvider({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider theme={theme} disableTransitionOnChange defaultMode="system">
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
