import {
  hasDevConsoleCredentials,
  isDevConsoleAccessAllowed,
} from '@dg/services/auth/devConsoleBasicAuth';
import { devConsoleRoute, homeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  greenhouseRewritePath,
  publicPathForInternalGreenhouse,
} from './services/greenhouseRewrite';
import { isNextFlightRequest } from './services/isNextFlightRequest';
import {
  negotiateMarkdown,
  rewriteToPath,
  withMarkdownAlternate,
} from './services/markdown/contentNegotiation';

/**
 * Protects `/dev-console` with Basic Auth in production only. Non-production
 * environments are allowed through for local development convenience.
 *
 * When credentials are configured, responds with 401 + WWW-Authenticate
 * to trigger the browser's native login dialog. If the user cancels the
 * dialog, a meta refresh in the response body redirects them home. This
 * uses meta refresh instead of JavaScript because browsers may not
 * execute scripts in 401 response bodies. This is the one
 * piece that can't use Next.js rendering APIs — the proxy returns a raw
 * Response that bypasses the component pipeline, so the `unauthorized.tsx`
 * boundary can't handle this case (it serves as defense-in-depth for any
 * auth bypass instead).
 *
 * Prefetch and RSC requests receive a plain 401 (no WWW-Authenticate),
 * which fails them without triggering the browser's auth dialog. The
 * client router then falls back to a hard navigation for the real dialog.
 *
 * Also negotiates Markdown for registered public pages.
 */
function protectDevConsole(request: NextRequest): NextResponse | null {
  if (!request.nextUrl.pathname.startsWith(devConsoleRoute)) {
    return null;
  }

  if (isDevConsoleAccessAllowed(request.headers.get('authorization'))) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(homeRoute, request.url);

  if (!hasDevConsoleCredentials()) {
    return NextResponse.redirect(redirectUrl);
  }

  // For prefetch/RSC requests (client-side navigation via NextLink), return
  // 401 WITHOUT the WWW-Authenticate header. This cleanly fails the request
  // without triggering the browser's native auth dialog:
  // - Prefetch: fails silently (browsers ignore failed prefetches)
  // - RSC navigation: client router can't parse the response as RSC data,
  //   falls back to a hard navigation which triggers the real auth dialog
  // Using redirect() here instead would confuse the client router — it
  // follows the 307, gets home page RSC data, and creates duplicate prompts.
  // Detect via Accept: text/x-component too — Proxy strips Flight headers.
  if (isNextFlightRequest(request)) {
    return new NextResponse(null, { status: 401 });
  }

  // Trigger the browser's native Basic Auth dialog. The HTML body only
  // renders if the user cancels — successful auth re-sends the request
  // with credentials and this body is discarded. Meta refresh is used
  // instead of JavaScript because browsers may not execute scripts in
  // 401 response bodies after dismissing the auth dialog.
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl.pathname}"></head></html>`;
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'WWW-Authenticate': 'Basic realm="Dev Console"',
    },
    status: 401,
  });
}

/**
 * Keeps the greenhouse homepage from becoming a second public homepage. It is
 * a rewrite target only, so a direct hit is a duplicate of `/` and is sent
 * there. Rewrites don't re-enter the proxy, so this never intercepts the
 * homepage's own rewrite.
 */
function hideInternalGreenhouseRoute(request: NextRequest): NextResponse | null {
  const publicPath = publicPathForInternalGreenhouse(request.nextUrl.pathname);
  if (!publicPath) {
    return null;
  }
  return NextResponse.redirect(new URL(publicPath, request.url));
}

export async function proxy(request: NextRequest) {
  const devConsoleResponse = protectDevConsole(request);
  if (devConsoleResponse) {
    return devConsoleResponse;
  }

  const internalRouteResponse = hideInternalGreenhouseRoute(request);
  if (internalRouteResponse) {
    return internalRouteResponse;
  }

  const markdownResponse = negotiateMarkdown(request);
  if (markdownResponse) {
    return markdownResponse;
  }

  const rewritePath = await greenhouseRewritePath(request);
  const response = rewritePath ? rewriteToPath(request, rewritePath) : NextResponse.next();
  return withMarkdownAlternate(request, response);
}

export const config = {
  matcher: [
    /*
     * Run on document navigations and `.md` twins. Skip Next/Vercel
     * internals, API routes, and common static asset extensions.
     * Registered Markdown pages are filtered again in negotiateMarkdown,
     * so new public pages only need the shared registry — not this list.
     */
    '/((?!_next/|_vercel/|api/|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|txt|xml|webmanifest)$).*)',
    '/dev-console/:path*',
  ],
};
