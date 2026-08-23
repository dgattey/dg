'use client';

import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getTheme } from '.';
import { GREENHOUSE_TYPE_VARS, getGreenhouseTypographyOverrides } from './typography';

const greenhouseTheme = createTheme(getTheme(), {
  typography: getGreenhouseTypographyOverrides(),
});

/**
 * Nested theme for greenhouse chrome only. Flag-off pages never mount this,
 * so `:root` typography stays the existing scale.
 */
export function GreenhouseTypeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={greenhouseTheme}>
      <Box data-greenhouse-type="" sx={{ ...GREENHOUSE_TYPE_VARS, display: 'contents' }}>
        {children}
      </Box>
    </ThemeProvider>
  );
}
