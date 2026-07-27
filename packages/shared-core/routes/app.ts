/**
 * Shared app route path constants and the public Markdown page registry.
 * Adding a Markdown-capable page here is the source of truth for path
 * helpers, sitemap, llms.txt, and Accept negotiation.
 */

export const homeRoute = '/' as const;

export const musicRoute = '/music' as const;

export const devConsoleRoute = '/dev-console' as const;

export const llmsTxtRoute = '/llms.txt' as const;

export const llmsFullTxtRoute = '/llms-full.txt' as const;

/**
 * Internal rewrite target that serves Markdown for a public HTML path.
 * Not a public API — agents use `.md` URLs or Accept negotiation instead.
 */
export const internalMarkdownRoutePrefix = '/llm-markdown' as const;

export type MarkdownPageDefinition = {
  /** HTML path (`/` or `/music`). */
  path: string;
  /** Short title used in llms.txt and fallback Markdown. */
  title: string;
  /** One-line summary for llms.txt. */
  summary: string;
  /** sitemap.xml changefreq. */
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  /** sitemap.xml priority 0–1. */
  priority: number;
};

/**
 * Public Markdown-capable pages. Order is the curated llms.txt order.
 */
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
] as const satisfies ReadonlyArray<MarkdownPageDefinition>;

export type MarkdownPagePath = (typeof markdownPages)[number]['path'];

export const markdownPagePaths: ReadonlyArray<MarkdownPagePath> = markdownPages.map(
  (page) => page.path,
);

/**
 * True when this HTML path has a Markdown representation.
 */
export function isMarkdownPagePath(pathname: string): pathname is MarkdownPagePath {
  return (markdownPagePaths as ReadonlyArray<string>).includes(pathname);
}

/**
 * Looks up registry metadata for a Markdown-capable path.
 */
export function getMarkdownPage(pathname: MarkdownPagePath): (typeof markdownPages)[number] {
  const page = markdownPages.find((entry) => entry.path === pathname);
  if (!page) {
    throw new Error(`Missing markdown page registry entry for ${pathname}`);
  }
  return page;
}

/**
 * Maps an HTML page path to its `.md` twin (`/` → `/index.md`).
 */
export function htmlPathToMarkdownPath(pathname: string): string | null {
  if (!isMarkdownPagePath(pathname)) {
    return null;
  }
  return pathname === homeRoute ? '/index.md' : `${pathname}.md`;
}

/**
 * Maps a `.md` path back to its HTML page (`/index.md` → `/`).
 */
export function markdownPathToHtmlPath(pathname: string): MarkdownPagePath | null {
  if (pathname === '/index.md') {
    return isMarkdownPagePath(homeRoute) ? homeRoute : null;
  }
  if (!pathname.endsWith('.md')) {
    return null;
  }
  const htmlPath = pathname.slice(0, -3);
  return isMarkdownPagePath(htmlPath) ? htmlPath : null;
}

/**
 * Internal route used by proxy rewrites for both `.md` URLs and Accept negotiation.
 */
export function htmlPathToInternalMarkdownPath(pathname: MarkdownPagePath): string {
  return pathname === homeRoute
    ? internalMarkdownRoutePrefix
    : `${internalMarkdownRoutePrefix}${pathname}`;
}
