import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { useSyncExternalStore } from 'react';

const subscribeToSystemDark = (onStoreChange: () => void) => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', onStoreChange);
  return () => media.removeEventListener('change', onStoreChange);
};

const getSystemDarkSnapshot = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const getServerSystemDarkSnapshot = () => false;

/** Whether maps should draw their dark basemap, following the site's color scheme. */
export function useDarkMap() {
  const { preference } = useColorScheme();
  const systemDark = useSyncExternalStore(
    subscribeToSystemDark,
    getSystemDarkSnapshot,
    getServerSystemDarkSnapshot,
  );
  return preference === 'dark' || (preference === 'system' && systemDark);
}
