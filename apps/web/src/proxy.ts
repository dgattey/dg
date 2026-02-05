import {
  hasDevConsoleCredentials,
  isDevConsoleAccessAllowed,
} from '@dg/services/auth/devConsoleBasicAuth';
import { homeRoute } from '@dg/shared-core/routes/app';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Protects `/dev-console` with Basic Auth. When credentials are configured,
 * responds with 401 + WWW-Authenticate to trigger the browser's native login
 * dialog. Without credentials in non-production, access is allowed for local
 * development.
 */
export function proxy(request: NextRequest) {
  if (isDevConsoleAccessAllowed(request.headers.get('authorization'))) {
    return NextResponse.next();
  }

  // When credentials are configured, prompt the browser's native Basic Auth dialog.
  // Otherwise redirect to home (no credentials to prompt for).
  if (hasDevConsoleCredentials()) {
    return new NextResponse('Unauthorized', {
      headers: { 'WWW-Authenticate': 'Basic realm="Dev Console"' },
      status: 401,
    });
  }

  return NextResponse.redirect(new URL(homeRoute, request.url));
}

export const config = {
  matcher: ['/dev-console/:path*'],
};
