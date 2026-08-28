import {
  hasDevConsoleCredentials,
  isDevConsoleAccessAllowed,
} from '@dg/services/auth/devConsoleBasicAuth';
import { devConsoleRoute, homeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { interactiveRedesign } from './flags';
import {
  publicPathFromRedesign,
  redesignRewritePath,
  shouldSkipRedesignRewrite,
} from './redesignRouting';
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

function copyHeader(from: NextResponse, to: NextResponse, name: string): void {
  const value = from.headers.get(name);
  if (value) {
    to.headers.set(name, value);
  }
}

function isTerminalMarkdownResponse(response: NextResponse): boolean {
  return response.status === 406 || Boolean(response.headers.get('x-middleware-rewrite'));
}

async function isCollageEnabled(): Promise<boolean> {
  if (process.env.INTERACTIVE_REDESIGN === '1') {
    return true;
  }
  try {
    return await interactiveRedesign();
  } catch {
    return false;
  }
}

async function collageResponse(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  if (shouldSkipRedesignRewrite(pathname) || !(await isCollageEnabled())) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = redesignRewritePath(pathname);
  return NextResponse.rewrite(url);
}

export async function proxy(request: NextRequest) {
  const publicPath = publicPathFromRedesign(request.nextUrl.pathname);
  if (publicPath !== null) {
    const url = request.nextUrl.clone();
    url.pathname = publicPath;
    return NextResponse.redirect(url);
  }

  const devConsoleResponse = protectDevConsole(request);
  if (devConsoleResponse) {
    return devConsoleResponse;
  }

  const markdownResponse = negotiateMarkdown(request);
  if (markdownResponse && isTerminalMarkdownResponse(markdownResponse)) {
    return markdownResponse;
  }

  const response = await collageResponse(request);
  if (markdownResponse) {
    copyHeader(markdownResponse, response, 'Link');
    copyHeader(markdownResponse, response, 'Vary');
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/|_vercel/|api/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt|xml|webmanifest)$).*)',
    '/dev-console/:path*',
  ],
};
