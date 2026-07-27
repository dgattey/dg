/**
 * Shared app route path constants.
 */
export const homeRoute = '/' as const;

export const musicRoute = '/music' as const;

export const devConsoleRoute = '/dev-console' as const;

export const llmsTxtRoute = '/llms.txt' as const;

export const llmsFullTxtRoute = '/llms-full.txt' as const;

/** Public pages that expose a Markdown representation. */
export const markdownPagePaths = [homeRoute, musicRoute] as const;

export type MarkdownPagePath = (typeof markdownPagePaths)[number];

/**
 * Maps an HTML page path to its `.md` twin (`/` → `/index.md`).
 */
export function htmlPathToMarkdownPath(pathname: string): string | null {
  if (pathname === homeRoute) {
    return '/index.md';
  }
  if (pathname === musicRoute) {
    return `${musicRoute}.md`;
  }
  return null;
}

/**
 * Maps a `.md` path back to its HTML page (`/index.md` → `/`).
 */
export function markdownPathToHtmlPath(pathname: string): string | null {
  if (pathname === '/index.md') {
    return homeRoute;
  }
  if (pathname === `${musicRoute}.md`) {
    return musicRoute;
  }
  return null;
}

/**
 * True when this HTML path has a Markdown representation.
 */
export function isMarkdownPagePath(pathname: string): pathname is MarkdownPagePath {
  return (markdownPagePaths as ReadonlyArray<string>).includes(pathname);
}
