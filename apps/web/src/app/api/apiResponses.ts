import 'server-only';

import { timingSafeEqualStrings } from '@dg/services/auth/devConsoleBasicAuth';
import { devConsoleRoute } from '@dg/shared-core/routes/app';
import { type NextRequest, NextResponse } from 'next/server';
import { isDevConsoleAccessAllowed, VERCEL_SESSION_COOKIE } from '../../auth/vercel/session';

const BEARER_PREFIX = 'Bearer ';

export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get('authorization');
  if (!secret || !authHeader?.startsWith(BEARER_PREFIX)) {
    return false;
  }
  return timingSafeEqualStrings(authHeader.slice(BEARER_PREFIX.length), secret);
}

export const jsonError = (message: string, status = 500) =>
  NextResponse.json({ error: message }, { status });

export function redirectToConsole(request: NextRequest, searchParams?: Record<string, string>) {
  const url = new URL(devConsoleRoute, request.url);
  if (url.hostname === 'localhost') {
    url.protocol = 'http:';
  }
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }
  return NextResponse.redirect(url);
}

export function redirectToConsoleWithAuthError(request: NextRequest, reason: string) {
  return redirectToConsole(request, { reason, vercel_auth: 'error' });
}

export function requireDevConsoleAuth(request: NextRequest): NextResponse | null {
  if (isDevConsoleAccessAllowed(request.cookies.get(VERCEL_SESSION_COOKIE)?.value)) {
    return null;
  }
  return jsonError('Authentication required', 401);
}
