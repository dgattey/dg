/**
 * @jest-environment node
 */

import { vercelAuthRoute } from '@dg/shared-core/routes/api';
import { NextRequest } from 'next/server';
import { GET as callback } from '../callback/route';
import { GET as authorize } from '../route';

jest.mock('@dg/services/oauth/oauthSecurity', () => ({
  generateCodeChallenge: () => 'test-code-challenge',
  generateCodeVerifier: () => 'test-code-verifier',
  generateSecureState: jest
    .fn()
    .mockImplementation(() => `secure-${Math.random().toString(36).slice(2)}`),
}));

const cookieStore = new Map<string, string>();

jest.mock('next/headers', () => ({
  cookies: async () => ({
    set: (name: string, value: string) => {
      cookieStore.set(name, value);
    },
  }),
}));

describe('Vercel auth authorize route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    cookieStore.clear();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_VERCEL_APP_CLIENT_ID: 'test-client-id',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('redirects to Vercel authorize with PKCE params', async () => {
    const { generateSecureState } = jest.requireMock('@dg/services/oauth/oauthSecurity') as {
      generateSecureState: jest.Mock;
    };
    generateSecureState
      .mockReturnValueOnce('test-state-value')
      .mockReturnValueOnce('test-nonce-value');

    const request = new NextRequest(`https://example.com${vercelAuthRoute}`);
    const response = await authorize(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('Location');
    expect(location).toContain('https://vercel.com/oauth/authorize?');
    expect(location).toContain('client_id=test-client-id');
    expect(location).toContain('code_challenge=test-code-challenge');
    expect(location).toContain('code_challenge_method=S256');
    expect(location).toContain('response_type=code');
    expect(location).toContain('scope=openid+email+profile');
    expect(location).toContain('state=test-state-value');
    expect(location).toContain('nonce=test-nonce-value');
    expect(location).toContain(encodeURIComponent('https://example.com/api/auth/vercel/callback'));
    expect(cookieStore.get('vercel_oauth_state')).toBe('test-state-value');
    expect(cookieStore.get('vercel_oauth_nonce')).toBe('test-nonce-value');
    expect(cookieStore.get('vercel_oauth_code_verifier')).toBe('test-code-verifier');
  });

  it('redirects to console when client id is missing', async () => {
    delete process.env.NEXT_PUBLIC_VERCEL_APP_CLIENT_ID;
    const request = new NextRequest(`https://example.com${vercelAuthRoute}`);
    const response = await authorize(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('/dev-console');
    expect(response.headers.get('Location')).toContain('vercel_auth=error');
    expect(response.headers.get('Location')).toContain('reason=missing_client_id');
  });
});

describe('Vercel auth callback route', () => {
  it('rejects requests with mismatched state', async () => {
    const url = new URL('https://example.com/api/auth/vercel/callback');
    url.searchParams.set('code', 'auth-code');
    url.searchParams.set('state', 'attacker-state');

    const request = new NextRequest(url, {
      headers: {
        cookie:
          'vercel_oauth_state=expected-state; vercel_oauth_nonce=n; vercel_oauth_code_verifier=v',
      },
    });

    const response = await callback(request);

    expect(response.status).toBe(307);
    const location = response.headers.get('Location');
    expect(location).toContain('/dev-console');
    expect(location).toContain('vercel_auth=error');
    expect(location).toContain('reason=state_mismatch');
  });

  it('rejects requests with missing code', async () => {
    const url = new URL('https://example.com/api/auth/vercel/callback');
    url.searchParams.set('state', 'expected-state');

    const request = new NextRequest(url, {
      headers: {
        cookie: 'vercel_oauth_state=expected-state',
      },
    });

    const response = await callback(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toContain('reason=missing_code');
  });
});
