import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { type NextRequest, NextResponse } from 'next/server';

export function redirectToConsole(request: NextRequest) {
  const url = new URL(devConsoleRoute, request.url);
  if (url.hostname === 'localhost') {
    url.protocol = 'http:';
  }
  return NextResponse.redirect(url);
}

export function redirectToConsoleWithAuthError(request: NextRequest, reason: string) {
  const url = new URL(devConsoleRoute, request.url);
  if (url.hostname === 'localhost') {
    url.protocol = 'http:';
  }
  url.searchParams.set('vercel_auth', 'error');
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}
