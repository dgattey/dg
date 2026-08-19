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
import { isNextFlightRequest } from '../isNextFlightRequest';

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

/**
 * Rewrites the request to an internal path, keeping `Vary: Accept` so a
 * negotiated response is never reused across content types.
 */
export const rewriteToPath = (request: NextRequest, pathname: string): NextResponse => {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const rewritten = NextResponse.rewrite(url);
  appendVaryAccept(rewritten.headers);
  return rewritten;
};

const rewriteToMarkdown = (request: NextRequest, htmlPath: MarkdownPagePath): NextResponse =>
  rewriteToPath(request, htmlPathToInternalMarkdownPath(htmlPath));

/**
 * The registered page this request negotiates for, or null when negotiation
 * does not apply. Flight/RSC and non-GET are excluded: negotiation must not
 * 406 a `text/x-component` resume.
 */
const negotiablePagePath = (request: NextRequest): MarkdownPagePath | null => {
  const pathname = request.nextUrl.pathname;
  if (!isMarkdownPagePath(pathname) || isNextFlightRequest(request) || request.method !== 'GET') {
    return null;
  }
  return pathname;
};

/**
 * Resolves requests that must not be served as HTML: `.md` twins, an Accept
 * that explicitly asks for Markdown, and Accept headers we cannot satisfy.
 *
 * Returns null when the request should continue as HTML, leaving the caller to
 * build that response — which is what lets the homepage still be rewritten to
 * its flagged layout. Advertise the Markdown twin on it with
 * `withMarkdownAlternate`.
 */
export function negotiateMarkdown(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  const htmlFromMarkdown = markdownPathToHtmlPath(pathname);
  if (htmlFromMarkdown) {
    return rewriteToMarkdown(request, htmlFromMarkdown);
  }

  const pagePath = negotiablePagePath(request);
  if (!pagePath) {
    return null;
  }

  const acceptHeader = request.headers.get('accept');
  const chosen = preferredType(acceptHeader, PRODUCES);
  const markdownPath = htmlPathToMarkdownPath(pagePath);

  if (chosen === 'text/markdown' && hasExplicitType(acceptHeader, 'text/markdown')) {
    return rewriteToMarkdown(request, pagePath);
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

  return null;
}

/**
 * Advertises a registered page's Markdown twin on the HTML response being
 * served for it, and marks that response as varying by Accept.
 */
export function withMarkdownAlternate(request: NextRequest, response: NextResponse): NextResponse {
  const pagePath = negotiablePagePath(request);
  if (!pagePath) {
    return response;
  }

  const markdownPath = htmlPathToMarkdownPath(pagePath);
  appendVaryAccept(response.headers);
  response.headers.set('Link', `<${markdownPath}>; rel="alternate"; type="text/markdown"`);
  return response;
}
