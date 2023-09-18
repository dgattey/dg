import CssBaseline from '@mui/material/CssBaseline';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import { getTheme } from 'ui/theme';

/**
 * Created just once per app lifecycle
 */
const theme = getTheme();

/**
 * Applies theming + reset + other global styles to the full app
 */
export function GlobalStyleProvider({ children }: { children: React.ReactNode }) {
  return (
    <CssVarsProvider defaultMode="system" disableTransitionOnChange theme={theme}>
      <CssBaseline />
      {children}
    </CssVarsProvider>
  );
}
