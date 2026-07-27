import { hasExplicitType, preferredType } from '@dg/shared-core/http/accept';
import { htmlPathToMarkdownPath, isMarkdownPagePath } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PRODUCES = ['text/html', 'text/markdown'] as const;

const appendVaryAccept = (headers: Headers): void => {
  const existing = headers.get('Vary');
  if (!existing) {
    headers.set('Vary', 'Accept');
    return;
  }
  const tokens = existing.split(',').map((token) => token.trim().toLowerCase());
  if (!tokens.includes('accept')) {
    headers.set('Vary', `${existing}, Accept`);
  }
};

const appendMarkdownLink = (headers: Headers, htmlPath: string): void => {
  const markdownPath = htmlPathToMarkdownPath(htmlPath);
  if (!markdownPath) {
    return;
  }
  const link = `<${markdownPath}>; rel="alternate"; type="text/markdown"`;
  const existing = headers.get('Link');
  headers.set('Link', existing ? `${existing}, ${link}` : link);
};

const isNextInternalRequest = (request: NextRequest): boolean =>
  request.headers.get('rsc') === '1' ||
  request.headers.get('next-router-prefetch') === '1' ||
  request.headers.get('purpose') === 'prefetch' ||
  request.method !== 'GET';

/**
 * Negotiates Markdown vs HTML for public pages and advertises Markdown
 * alternates via Link + Vary headers. `.md` twins are real route handlers;
 * Accept-based requests rewrite to those paths.
 */
export function negotiateMarkdown(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  if (!isMarkdownPagePath(pathname) || isNextInternalRequest(request)) {
    return null;
  }

  const acceptHeader = request.headers.get('accept');
  const chosen = preferredType(acceptHeader, PRODUCES);
  const markdownPath = htmlPathToMarkdownPath(pathname);

  if (
    chosen === 'text/markdown' &&
    hasExplicitType(acceptHeader, 'text/markdown') &&
    markdownPath
  ) {
    const url = request.nextUrl.clone();
    url.pathname = markdownPath;
    const rewritten = NextResponse.rewrite(url);
    appendVaryAccept(rewritten.headers);
    return rewritten;
  }

  // Spec-correct 406 only for document GETs that reject every representation
  // we produce. Skip Next.js RSC/prefetch traffic via isNextInternalRequest.
  if (chosen === null && acceptHeader?.trim()) {
    const links = [
      `<${pathname}>; rel="alternate"; type="text/html"`,
      markdownPath ? `<${markdownPath}>; rel="alternate"; type="text/markdown"` : null,
    ]
      .filter(Boolean)
      .join(', ');

    return new NextResponse('Not Acceptable\n\nAvailable: text/html, text/markdown\n', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Link: links,
        Vary: 'Accept',
      },
      status: 406,
    });
  }

  const response = NextResponse.next();
  appendVaryAccept(response.headers);
  appendMarkdownLink(response.headers, pathname);
  return response;
}
