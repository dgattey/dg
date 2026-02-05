import type { NextRequest, NextResponse } from 'next/server';
import { handleOauthCallback } from './handleOauthCallback';
import { handleOauthInit } from './handleOauthInit';
import { redirectToConsole } from './redirectToConsole';

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

  // No valid params - redirect to console
  return Promise.resolve(redirectToConsole(request));
}
