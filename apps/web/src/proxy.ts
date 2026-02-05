import {
  hasDevConsoleCredentials,
  isDevConsoleAccessAllowed,
} from '@dg/services/auth/devConsoleBasicAuth';
import { homeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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
 * Prefetch and RSC requests are redirected to home rather than returning
 * 401, which prevents the browser's auth dialog from firing during
 * client-side navigation (which would cause duplicate prompts).
 */
export function proxy(request: NextRequest) {
  if (isDevConsoleAccessAllowed(request.headers.get('authorization'))) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(homeRoute, request.url);

  // For prefetch/RSC requests, redirect silently instead of triggering the
  // browser's auth dialog. This prevents duplicate prompts from prefetch +
  // navigation, and avoids leaking page content to unauthenticated prefetches.
  const isPrefetchOrRsc =
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('rsc') === '1';

  if (isPrefetchOrRsc || !hasDevConsoleCredentials()) {
    return NextResponse.redirect(redirectUrl);
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

export const config = {
  matcher: ['/dev-console/:path*'],
};
