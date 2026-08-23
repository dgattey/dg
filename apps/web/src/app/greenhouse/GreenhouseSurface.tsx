import 'server-only';

import type { ReactNode } from 'react';
import { interactiveRedesign } from '../../flags';
import { GreenhouseFrame } from './GreenhouseFrame';
import type { GreenhouseSurface as GreenhouseSurfaceName } from './greenhouseLayout';

type GreenhouseSurfaceProps = {
  children: ReactNode;
  surface: GreenhouseSurfaceName;
};

/**
 * Wraps a public route in `GreenhouseFrame` when the redesign flag is on.
 * Flag-off returns children unchanged so existing pages stay a one-line wrap.
 */
export async function GreenhouseSurface({ children, surface }: GreenhouseSurfaceProps) {
  if (!(await interactiveRedesign())) {
    return children;
  }
  return <GreenhouseFrame surface={surface}>{children}</GreenhouseFrame>;
}
