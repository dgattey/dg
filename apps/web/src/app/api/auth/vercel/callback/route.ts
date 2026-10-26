import { timingSafeEqualStrings } from '@dg/services/auth/devConsoleBasicAuth';
import { vercelAuthCallbackRoute } from '@dg/shared-core/routes/api';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { clearCookieOptions, sessionCookieOptions } from '../../../../../auth/vercel/cookieOptions';
import {
  VERCEL_OAUTH_CODE_VERIFIER_COOKIE,
  VERCEL_OAUTH_NONCE_COOKIE,
  VERCEL_OAUTH_STATE_COOKIE,
  VERCEL_TOKEN_URL,
  VERCEL_USERINFO_URL,
} from '../../../../../auth/vercel/oauthCookies';
import {
  isAuthorizedVercelUser,
  signSession,
  VERCEL_SESSION_COOKIE,
} from '../../../../../auth/vercel/session';
import { redirectToConsole, redirectToConsoleWithAuthError } from '../../../apiResponses';

type TokenResponse = {
  access_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

type UserInfoResponse = {
  sub: string;
  email?: string;
  name?: string;
  preferred_username?: string;
};

function decodeIdTokenNonce(idToken: string): string | null {
  const parts = idToken.split('.');
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      nonce?: string;
    };
    return typeof payload.nonce === 'string' ? payload.nonce : null;
  } catch {
    return null;
  }
}

async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const clientId = process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
  const clientSecret = process.env.VERCEL_APP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Vercel OAuth client credentials are not configured');
  }

  const response = await fetch(VERCEL_TOKEN_URL, {
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
    cache: 'no-store',
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Token exchange failed: ${errorData}`);
  }

  return (await response.json()) as TokenResponse;
}

async function fetchUserInfo(accessToken: string): Promise<UserInfoResponse> {
  const response = await fetch(VERCEL_USERINFO_URL, {
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Userinfo failed: ${errorData}`);
  }

  return (await response.json()) as UserInfoResponse;
}

async function clearOauthTempCookies() {
  const cookieStore = await cookies();
  const clearOptions = clearCookieOptions();
  cookieStore.set(VERCEL_OAUTH_STATE_COOKIE, '', clearOptions);
  cookieStore.set(VERCEL_OAUTH_NONCE_COOKIE, '', clearOptions);
  cookieStore.set(VERCEL_OAUTH_CODE_VERIFIER_COOKIE, '', clearOptions);
}

/**
 * Completes Sign in with Vercel: validates state/nonce, exchanges the code,
 * verifies that the identity belongs to the site owner, and sets a signed
 * session cookie (no Vercel tokens stored).
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');

    if (!code) {
      return redirectToConsoleWithAuthError(request, 'missing_code');
    }

    const storedState = request.cookies.get(VERCEL_OAUTH_STATE_COOKIE)?.value;
    const storedNonce = request.cookies.get(VERCEL_OAUTH_NONCE_COOKIE)?.value;
    const codeVerifier = request.cookies.get(VERCEL_OAUTH_CODE_VERIFIER_COOKIE)?.value;

    if (!timingSafeEqualStrings(state, storedState)) {
      return redirectToConsoleWithAuthError(request, 'state_mismatch');
    }

    if (!codeVerifier) {
      return redirectToConsoleWithAuthError(request, 'missing_verifier');
    }

    const redirectUri = `${request.nextUrl.origin}${vercelAuthCallbackRoute}`;
    const tokenData = await exchangeCodeForToken(code, codeVerifier, redirectUri);
    const idTokenNonce = decodeIdTokenNonce(tokenData.id_token);

    if (!timingSafeEqualStrings(idTokenNonce, storedNonce)) {
      return redirectToConsoleWithAuthError(request, 'nonce_mismatch');
    }

    const userInfo = await fetchUserInfo(tokenData.access_token);
    if (!userInfo.sub || !userInfo.email) {
      await clearOauthTempCookies();
      return redirectToConsoleWithAuthError(request, 'missing_identity');
    }

    if (
      !isAuthorizedVercelUser({
        email: userInfo.email,
        id: userInfo.sub,
        username: userInfo.preferred_username,
      })
    ) {
      await clearOauthTempCookies();
      return redirectToConsoleWithAuthError(request, 'unauthorized_user');
    }

    const signed = signSession({
      email: userInfo.email,
      id: userInfo.sub,
      ...(userInfo.name ? { name: userInfo.name } : {}),
    });

    if (!signed) {
      await clearOauthTempCookies();
      return redirectToConsoleWithAuthError(request, 'session_secret_missing');
    }

    const cookieStore = await cookies();
    cookieStore.set(VERCEL_SESSION_COOKIE, signed, sessionCookieOptions());
    await clearOauthTempCookies();

    return redirectToConsole(request);
  } catch {
    await clearOauthTempCookies().catch(() => undefined);
    return redirectToConsoleWithAuthError(request, 'callback_failed');
  }
}
