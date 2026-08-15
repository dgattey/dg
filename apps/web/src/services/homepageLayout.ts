import { homeRoute, internalInteractiveHomeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { interactiveRedesign } from '../flags';
import { rollForestSeed } from './forestSeeds';

/**
 * Flag-off leaves `/` as the grid. Flag-on rewrites to a prerendered
 * `/interactive-home/s/:seed` so both layouts ship complete HTML.
 */
export async function homepageRewritePath(request: NextRequest): Promise<string | null> {
  if (request.nextUrl.pathname !== homeRoute) {
    return null;
  }

  const isInteractive = await interactiveRedesign(request);
  return isInteractive ? `${internalInteractiveHomeRoute}/s/${rollForestSeed()}` : null;
}
