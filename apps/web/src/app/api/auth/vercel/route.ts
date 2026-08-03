import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateSecureState,
} from '@dg/services/oauth/oauthSecurity';
import { vercelAuthCallbackRoute } from '@dg/shared-core/routes/api';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { oauthTempCookieOptions } from '../../../../auth/vercel/cookieOptions';
import {
  VERCEL_AUTHORIZE_URL,
  VERCEL_OAUTH_CODE_VERIFIER_COOKIE,
  VERCEL_OAUTH_NONCE_COOKIE,
  VERCEL_OAUTH_SCOPES,
  VERCEL_OAUTH_STATE_COOKIE,
} from '../../../../auth/vercel/oauthCookies';
import { redirectToConsoleWithAuthError } from './redirectToConsole';
/**
 * Starts Sign in with Vercel: PKCE + state/nonce cookies, then redirect to
 * https://vercel.com/oauth/authorize.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
  if (!clientId) {
    return redirectToConsoleWithAuthError(request, 'missing_client_id');
  }

  const state = generateSecureState();
  const nonce = generateSecureState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const cookieStore = await cookies();
  const tempOptions = oauthTempCookieOptions();

  cookieStore.set(VERCEL_OAUTH_STATE_COOKIE, state, tempOptions);
  cookieStore.set(VERCEL_OAUTH_NONCE_COOKIE, nonce, tempOptions);
  cookieStore.set(VERCEL_OAUTH_CODE_VERIFIER_COOKIE, codeVerifier, tempOptions);

  const redirectUri = `${request.nextUrl.origin}${vercelAuthCallbackRoute}`;
  const queryParams = new URLSearchParams({
    client_id: clientId,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    nonce,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: VERCEL_OAUTH_SCOPES,
    state,
  });

  return NextResponse.redirect(`${VERCEL_AUTHORIZE_URL}?${queryParams.toString()}`);
}
