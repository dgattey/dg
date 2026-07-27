import { hasExplicitType, preferredType } from '@dg/shared-core/http/accept';
import {
  htmlPathToInternalMarkdownPath,
  htmlPathToMarkdownPath,
  isMarkdownPagePath,
  markdownPathToHtmlPath,
} from '@dg/shared-core/routes/app';
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

const rewriteToMarkdown = (
  request: NextRequest,
  htmlPath: Parameters<typeof htmlPathToInternalMarkdownPath>[0],
): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = htmlPathToInternalMarkdownPath(htmlPath);
  const rewritten = NextResponse.rewrite(url);
  appendVaryAccept(rewritten.headers);
  return rewritten;
};

/**
 * Negotiates Markdown vs HTML for registered public pages and rewrites
 * `.md` twins to the shared internal Markdown handler.
 */
export function negotiateMarkdown(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  const htmlFromMarkdown = markdownPathToHtmlPath(pathname);
  if (htmlFromMarkdown) {
    return rewriteToMarkdown(request, htmlFromMarkdown);
  }

  if (!isMarkdownPagePath(pathname) || isNextInternalRequest(request)) {
    return null;
  }

  const acceptHeader = request.headers.get('accept');
  const chosen = preferredType(acceptHeader, PRODUCES);
  const markdownPath = htmlPathToMarkdownPath(pathname);

  if (chosen === 'text/markdown' && hasExplicitType(acceptHeader, 'text/markdown')) {
    return rewriteToMarkdown(request, pathname);
  }

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
