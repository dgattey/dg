import 'server-only';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { interactiveRedesign } from '../../flags';
import { GreenhouseFrame } from './GreenhouseFrame';
import type { GreenhouseSurface as GreenhouseSurfaceName } from './greenhouseLayout';

type GreenhouseSurfaceProps = {
  children: ReactNode;
  surface: GreenhouseSurfaceName;
};

/**
 * Flag evaluation reads request cookies. Keep it off the static page
 * shell so `/music` and `/music/albums` can prerender under
 * `cacheComponents`.
 */
async function GreenhouseSurfaceSwitch({ children, surface }: GreenhouseSurfaceProps) {
  if (!(await interactiveRedesign())) {
    return children;
  }
  return <GreenhouseFrame surface={surface}>{children}</GreenhouseFrame>;
}

/**
 * Synchronous wrap for public routes. Flag-on paints `GreenhouseFrame`;
 * flag-off returns children unchanged. The fallback is a hole (`null`)
 * because callers may pass their own async flag switch as children.
 */
export function GreenhouseSurface({ children, surface }: GreenhouseSurfaceProps) {
  return (
    <Suspense fallback={null}>
      <GreenhouseSurfaceSwitch surface={surface}>{children}</GreenhouseSurfaceSwitch>
    </Suspense>
  );
}
