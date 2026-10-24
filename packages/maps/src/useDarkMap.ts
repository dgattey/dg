import { useColorScheme } from '@dg/ui/theme/useColorScheme';

/** Whether maps should draw their dark basemap, following the site's color scheme. */
export function useDarkMap() {
  return useColorScheme().scheme === 'dark';
}
