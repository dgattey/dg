import { homeRoute, internalInteractiveHomeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { interactiveRedesign } from '../flags';

/**
 * Picks the route that renders `/` for this request, evaluating
 * `interactive-redesign` before rendering starts.
 *
 * The flag reads a request-time cookie. Branching on it *inside* the page makes
 * the whole homepage request-time under Cache Components, so Next can only ship
 * it behind a Suspense boundary — and React fills a resolved boundary by
 * writing markup into a hidden container and swapping it in with an inline
 * script. With scripting off that swap never happens and the visitor sees only
 * the fallback, which broke no-JS for the grid as well as the world.
 *
 * Deciding here turns a request-time *layout* choice into a request-time
 * *routing* choice: each route has no request-time branch left, so both
 * prerender to complete HTML that needs no scripts to become visible.
 *
 * Returns null when `/` should render itself — a different path, or the flag
 * being off.
 */
export async function homepageRewritePath(request: NextRequest): Promise<string | null> {
  if (request.nextUrl.pathname !== homeRoute) {
    return null;
  }

  // Passing the request keeps evaluation off `next/headers`, so the flag reads
  // this visitor's cookies (session and Flags Explorer override) and nobody
  // else's.
  const isInteractive = await interactiveRedesign(request);
  return isInteractive ? internalInteractiveHomeRoute : null;
}
