import {
  hasDevConsoleCredentials,
  isDevConsoleAccessAllowed,
} from '@dg/services/auth/devConsoleBasicAuth';
import { initiateOauthFlow } from '@dg/services/oauth/initiateOauthFlow';
import { type NextRequest, NextResponse } from 'next/server';
import { redirectToConsole } from './redirectToConsole';

/**
 * Initiates an OAuth flow by generating secure state and PKCE,
 * storing them in the database, and redirecting to the provider.
 */
export async function handleOauthInit(request: NextRequest): Promise<NextResponse> {
  if (!isDevConsoleAccessAllowed(request.headers.get('authorization'))) {
    if (!hasDevConsoleCredentials()) {
      return new NextResponse('Not Found', { status: 404 });
    }
    return new NextResponse('Authentication required', {
      headers: { 'WWW-Authenticate': 'Basic realm="Dev Console"' },
      status: 401,
    });
  }

  const provider = request.nextUrl.searchParams.get('provider');
  const result = await initiateOauthFlow(provider);

  switch (result.status) {
    case 'redirect':
      return NextResponse.redirect(result.url);
    case 'invalid-provider':
    case 'missing-callback-url':
    case 'missing-client-id':
      return redirectToConsole(request);
  }
}
