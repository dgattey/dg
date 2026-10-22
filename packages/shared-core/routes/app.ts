/**
 * Shared app route path constants and the public Markdown page registry.
 * Adding a Markdown-capable page here is the source of truth for path
 * helpers, sitemap, llms.txt, and Accept negotiation.
 */

export const homeRoute = '/' as const;

export const musicRoute = '/music' as const;

export const favoriteAlbumsRoute = '/music/albums' as const;

export const musicStatsRoute = '/music/stats' as const;

export const readingRoute = '/reading' as const;

export const stravaRoute = '/strava' as const;

export const changelogRoute = '/changelog' as const;

export const siteMapRoute = '/site-map' as const;

/** Query key naming the album expanded in place on the favorite albums page. */
export const ALBUM_PARAM = 'album' as const;

/**
 * A favorite album expanded in place (`/music/albums?album=:id`).
 *
 * Deliberately a query rather than a path segment: expanding an album must not
 * change the route. A route change makes Next refetch the albums layout, which
 * re-suspends its boundary, replays the grid skeleton, and destroys the art the
 * transition was supposed to morph. Same route, new query, nothing torn down.
 */
export const albumRoute = (id: string) => `${favoriteAlbumsRoute}?${ALBUM_PARAM}=${id}`;

export const devConsoleRoute = '/dev-console' as const;

export const llmsTxtRoute = '/llms.txt' as const;

export const llmsFullTxtRoute = '/llms-full.txt' as const;

export const apiCatalogRoute = '/.well-known/api-catalog' as const;

export const apiOpenApiRoute = '/.well-known/openapi.json' as const;

export const apiStatusRoute = '/.well-known/api-status' as const;

/** Internal rewrite target for Markdown (not a public agent URL). */
const internalMarkdownRoutePrefix = '/llm-markdown' as const;

type MarkdownPageDefinition = {
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
  {
    changeFrequency: 'daily',
    path: musicStatsRoute,
    priority: 0.6,
    summary: 'Totals, top albums, and listening habits from my Spotify history',
    title: 'Listening stats',
  },
  {
    changeFrequency: 'weekly',
    path: readingRoute,
    priority: 0.6,
    summary: 'Books read, star ratings, and notes by year',
    title: 'Reading',
  },
  {
    changeFrequency: 'daily',
    path: stravaRoute,
    priority: 0.6,
    summary: 'Routes, yearly miles, and recent outings from my Strava history',
    title: 'Big map',
  },
  {
    changeFrequency: 'daily',
    path: changelogRoute,
    priority: 0.5,
    summary: 'Version history and release notes',
    title: 'Changelog',
  },
  {
    changeFrequency: 'weekly',
    path: siteMapRoute,
    priority: 0.5,
    summary: 'All pages, side projects, and machine-readable endpoints',
    title: 'Site map',
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
