import { completeOauthFlow } from '@dg/services/oauth/completeOauthFlow';
import type { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '../apiResponses';
import { redirectToConsole } from './redirectToConsole';

/**
 * Handles OAuth callback by validating state, exchanging code for token,
 * and redirecting to the console.
 */
export async function handleOauthCallback(request: NextRequest): Promise<NextResponse> {
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
