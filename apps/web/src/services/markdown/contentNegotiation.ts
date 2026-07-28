import { hasExplicitType, preferredType } from '@dg/shared-core/http/accept';
import {
  htmlPathToInternalMarkdownPath,
  htmlPathToMarkdownPath,
  isMarkdownPagePath,
  type MarkdownPagePath,
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

const rewriteToMarkdown = (request: NextRequest, htmlPath: MarkdownPagePath): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = htmlPathToInternalMarkdownPath(htmlPath);
  const rewritten = NextResponse.rewrite(url);
  appendVaryAccept(rewritten.headers);
  return rewritten;
};

const isNextInternalRequest = (request: NextRequest): boolean =>
  request.headers.get('rsc') === '1' ||
  request.headers.get('next-router-prefetch') === '1' ||
  request.headers.get('purpose') === 'prefetch' ||
  request.method !== 'GET';

/**
 * Negotiates Markdown vs HTML for registered pages and rewrites `.md` twins
 * to `/llm-markdown`.
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
    return new NextResponse('Not Acceptable\n\nAvailable: text/html, text/markdown\n', {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Link: `<${pathname}>; rel="alternate"; type="text/html", <${markdownPath}>; rel="alternate"; type="text/markdown"`,
        Vary: 'Accept',
      },
      status: 406,
    });
  }

  const response = NextResponse.next();
  appendVaryAccept(response.headers);
  response.headers.set('Link', `<${markdownPath}>; rel="alternate"; type="text/markdown"`);
  return response;
}
