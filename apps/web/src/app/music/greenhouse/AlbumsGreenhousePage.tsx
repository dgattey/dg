import 'server-only';

import { GreenhouseTypeProvider } from '@dg/ui/theme/GreenhouseTypeProvider';
import type { ReactNode } from 'react';

/**
 * Flag-on `/music/albums` content. The albums layout still owns the grid and
 * well so view transitions keep working. Route chrome is `GreenhouseSurface`
 * (`surface="music"`).
 */
export function AlbumsGreenhousePage({ children }: { children: ReactNode }) {
  return <GreenhouseTypeProvider>{children}</GreenhouseTypeProvider>;
}
