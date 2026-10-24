import { completeOauthFlow } from '@dg/services/oauth/completeOauthFlow';
import { initiateOauthFlow } from '@dg/services/oauth/initiateOauthFlow';
import { type NextRequest, NextResponse } from 'next/server';
import '../../../services/oauthTokenCache';
import { jsonError, redirectToConsole, requireDevConsoleBasicAuth } from '../apiResponses';

async function handleOauthInit(request: NextRequest): Promise<NextResponse> {
  const unauthorized = requireDevConsoleBasicAuth(request);
  if (unauthorized) {
    return unauthorized;
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

async function handleOauthCallback(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  const result = await completeOauthFlow({ code, state });
  switch (result.status) {
    case 'missing-code':
      return jsonError('Missing authorization code', 400);
    case 'missing-state':
      return jsonError('Missing state parameter', 400);
    case 'invalid-state':
      return jsonError('Invalid or expired OAuth state', 400);
    case 'unknown-provider':
      return jsonError('Unknown OAuth provider', 400);
    case 'error':
      return jsonError('Could not complete OAuth flow', 500);
    case 'success':
      return redirectToConsole(request);
  }
}

/**
 * Unified OAuth route handler.
 * - With `provider` param: initiates OAuth flow (redirects to provider)
 * - With `code` param: handles callback (exchanges code for token)
 */
export function GET(request: NextRequest): Promise<NextResponse> {
  const hasProvider = request.nextUrl.searchParams.has('provider');
  const hasCode = request.nextUrl.searchParams.has('code');

  if (hasProvider) {
    return handleOauthInit(request);
  }

  if (hasCode) {
    return handleOauthCallback(request);
  }

  return Promise.resolve(redirectToConsole(request));
}
