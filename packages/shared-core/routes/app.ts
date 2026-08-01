/**
 * Shared app route path constants and the public Markdown page registry.
 * Adding a Markdown-capable page here is the source of truth for path
 * helpers, sitemap, llms.txt, and Accept negotiation.
 */

export const homeRoute = '/' as const;

export const musicRoute = '/music' as const;

export const favoriteAlbumsRoute = '/music/albums' as const;

export const devConsoleRoute = '/dev-console' as const;

export const llmsTxtRoute = '/llms.txt' as const;

export const llmsFullTxtRoute = '/llms-full.txt' as const;

export const apiCatalogRoute = '/.well-known/api-catalog' as const;

export const apiOpenApiRoute = '/.well-known/openapi.json' as const;

export const apiStatusRoute = '/.well-known/api-status' as const;

/** Internal rewrite target for Markdown (not a public agent URL). */
export const internalMarkdownRoutePrefix = '/llm-markdown' as const;

export type MarkdownPageDefinition = {
  path: string;
  title: string;
  summary: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

/** Public Markdown-capable pages. Order is the curated llms.txt order. */
export const markdownPages = [
  {
    changeFrequency: 'weekly',
    path: homeRoute,
    priority: 1,
    summary: 'About, projects, location, and links',
    title: 'Home',
  },
  {
    changeFrequency: 'daily',
    path: musicRoute,
    priority: 0.7,
    summary: 'Recent Spotify plays',
    title: 'Listening history',
  },
  {
    changeFrequency: 'weekly',
    path: favoriteAlbumsRoute,
    priority: 0.6,
    summary: 'All-time favorite albums',
    title: 'Favorite albums',
  },
] as const satisfies ReadonlyArray<MarkdownPageDefinition>;

export type MarkdownPagePath = (typeof markdownPages)[number]['path'];

export const markdownPagePaths: ReadonlyArray<MarkdownPagePath> = markdownPages.map(
  (page) => page.path,
);

export function isMarkdownPagePath(pathname: string): pathname is MarkdownPagePath {
  return (markdownPagePaths as ReadonlyArray<string>).includes(pathname);
}

/** `.md` twin for a registered HTML path (`/` → `/index.md`). */
export function htmlPathToMarkdownPath(pathname: MarkdownPagePath): string {
  return pathname === homeRoute ? '/index.md' : `${pathname}.md`;
}

/** `.md` twin when the path might not be registered. */
export function tryHtmlPathToMarkdownPath(pathname: string): string | null {
  return isMarkdownPagePath(pathname) ? htmlPathToMarkdownPath(pathname) : null;
}

/** HTML path for a `.md` twin (`/index.md` → `/`). */
export function markdownPathToHtmlPath(pathname: string): MarkdownPagePath | null {
  if (pathname === '/index.md') {
    return homeRoute;
  }
  if (!pathname.endsWith('.md')) {
    return null;
  }
  const htmlPath = pathname.slice(0, -3);
  return isMarkdownPagePath(htmlPath) ? htmlPath : null;
}

/** Internal `/llm-markdown` path used by proxy rewrites. */
export function htmlPathToInternalMarkdownPath(pathname: MarkdownPagePath): string {
  return pathname === homeRoute
    ? internalMarkdownRoutePrefix
    : `${internalMarkdownRoutePrefix}${pathname}`;
}
