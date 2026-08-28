import {
  apiCatalogRoute,
  apiOpenApiRoute,
  apiStatusRoute,
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
  apiCatalogRoute,
  apiOpenApiRoute,
  apiStatusRoute,
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

export function shouldSkipRedesignRewrite(pathname: string): boolean {
  return REDESIGN_SKIP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
