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
    {
      missing: [
        { key: 'rsc', type: 'header' },
        { key: 'next-router-prefetch', type: 'header' },
        { key: 'purpose', type: 'header', value: 'prefetch' },
      ],
      source:
        '/((?!_next/|_vercel/|api/|dev-console(?:/|$)|\\.well-known/|llm-markdown/|(?:.*/)?(?:opengraph|twitter)-image|.*\\.(?!md$)[^/]+$).*)',
    },
    '/dev-console/:path*',
  ],
};
