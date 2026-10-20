import {
  hasDevConsoleCredentials,
  isDevConsoleAccessAllowed,
} from '@dg/services/auth/devConsoleBasicAuth';
import { devConsoleRoute, homeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isNextFlightRequest } from './services/isNextFlightRequest';
import { negotiateMarkdown } from './services/markdown/contentNegotiation';

function protectDevConsole(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith(devConsoleRoute)) {
    return null;
  }

  if (isDevConsoleAccessAllowed(request.headers.get('authorization'))) {
    return null;
  }

  const redirectUrl = new URL(homeRoute, request.url);

  if (!hasDevConsoleCredentials()) {
    return NextResponse.redirect(redirectUrl);
  }

  if (isNextFlightRequest(request)) {
    return new NextResponse(null, { status: 401 });
  }

  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl.pathname}"></head></html>`;
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'WWW-Authenticate': 'Basic realm="Dev Console"',
    },
    status: 401,
  });
}

export function proxy(request: NextRequest): NextResponse {
  return protectDevConsole(request) ?? negotiateMarkdown(request) ?? NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run only on page paths and `.md` twins. Every match is a billed
     * function invocation, even when the page itself is a CDN hit, so skip
     * Next/Vercel internals, route handlers, social images, and any path with
     * a file extension other than `.md` (assets and bot probes like `.php`).
     * Registered Markdown pages are filtered again in negotiateMarkdown,
     * so new public pages only need the shared registry — not this list.
     */
    '/((?!_next/|_vercel/|api/|\\.well-known/|llm-markdown/|(?:.*/)?(?:opengraph|twitter)-image|.*\\.(?!md$)[^/]+$).*)',
    '/dev-console/:path*',
  ],
};
