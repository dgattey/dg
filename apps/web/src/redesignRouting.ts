import {
  internalMarkdownRoutePrefix,
  llmsFullTxtRoute,
  llmsTxtRoute,
  redesignRoutePrefix,
} from '@dg/shared-core/routes/app';

/**
 * Public prefixes that must not be rewritten onto the collage route prefix.
 * Keep in sync with every app route.ts file via redesignRouting.test.ts.
 */
export const REDESIGN_SKIP_PREFIXES = [
  '/api',
  internalMarkdownRoutePrefix,
  '/.well-known',
  llmsTxtRoute,
  llmsFullTxtRoute,
  '/opengraph-image',
  '/twitter-image',
] as const;

export function publicPathFromRedesign(pathname: string): string | null {
  if (pathname === redesignRoutePrefix) {
    return '/';
  }
  if (!pathname.startsWith(`${redesignRoutePrefix}/`)) {
    return null;
  }
  const rest = pathname.slice(redesignRoutePrefix.length);
  return rest.length > 0 ? rest : '/';
}

export function redesignRewritePath(pathname: string): string {
  if (pathname === '/') {
    return redesignRoutePrefix;
  }
  return `${redesignRoutePrefix}${pathname}`;
}

/** No page route has a file extension; these are assets, handlers, or bot probes. */
const FILE_LIKE_PATH = /\.[^/]+$/;

/**
 * Paths that never render a page, so the proxy can skip the Flag Request a
 * collage decision costs. On Vercel, Web Analytics and Speed Insights load
 * scripts and post beacons under the observability base path, which the proxy
 * matcher can't exclude because the path is per-project.
 */
export function shouldSkipRedesignRewrite(pathname: string): boolean {
  const observabilityBasePath = process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_BASEPATH;
  return (
    FILE_LIKE_PATH.test(pathname) ||
    (observabilityBasePath !== undefined &&
      observabilityBasePath !== '' &&
      pathname.startsWith(`${observabilityBasePath}/`)) ||
    REDESIGN_SKIP_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}
