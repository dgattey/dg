import { homeRoute, internalGreenhouseHomeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { interactiveRedesign } from '../flags';

/**
 * Flag-off leaves `/` as the grid. Flag-on rewrites to the prerendered
 * greenhouse homepage. Music destinations are not rewritten yet.
 *
 * `GREENHOUSE_PREVIEW=1` forces the rewrite on local and Vercel preview
 * (`VERCEL_ENV !== 'production'`) so `/` can be photographed with real
 * data without flipping the Flags default. Never on Vercel production.
 */
export async function greenhouseRewritePath(request: NextRequest): Promise<string | null> {
  if (request.nextUrl.pathname !== homeRoute) {
    return null;
  }

  if (process.env.GREENHOUSE_PREVIEW === '1' && process.env.VERCEL_ENV !== 'production') {
    return internalGreenhouseHomeRoute;
  }

  const isInteractive = await interactiveRedesign(request);
  return isInteractive ? internalGreenhouseHomeRoute : null;
}

/**
 * Direct hits on the rewrite target are duplicates of the public URL.
 */
export function publicPathForInternalGreenhouse(pathname: string): string | null {
  if (
    pathname === internalGreenhouseHomeRoute ||
    pathname.startsWith(`${internalGreenhouseHomeRoute}/`)
  ) {
    return homeRoute;
  }
  return null;
}
