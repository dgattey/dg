import { useColorScheme } from 'hooks/useColorScheme';
import { createContext } from 'react';

/**
 * Provides app-wide color scheme data with dummy data to start it out
 */
export const ColorSchemeContext = createContext<ReturnType<typeof useColorScheme>>({
  colorScheme: 'light',
  isInitializedWithSystemScheme: false,
  isSystemScheme: false,
  updatePreferredScheme: () => false,
});
