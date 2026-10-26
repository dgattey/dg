/**
 * @jest-environment node
 */

import { mockEnv } from '@dg/testing/mocks';
import {
  isAuthorizedVercelUser,
  isDevConsoleAccessAllowed,
  parseVercelSessionCookie,
  signSession,
  VERCEL_SESSION_COOKIE,
} from '../session';

describe('Vercel session cookie and dev console authorization', () => {
  const originalSecret = process.env.VERCEL_APP_CLIENT_SECRET;

  beforeEach(() => {
    process.env.VERCEL_APP_CLIENT_SECRET = 'test-vercel-client-secret';
  });

  afterEach(() => {
    process.env.VERCEL_APP_CLIENT_SECRET = originalSecret;
  });

  it('round-trips a signed session for the site owner', () => {
    const signed = signSession({
      email: 'hi@dylangattey.com',
      id: 'user_sub_123',
      name: 'Dylan',
    });

    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(signed ?? undefined)).toEqual({
      email: 'hi@dylangattey.com',
      id: 'user_sub_123',
      name: 'Dylan',
    });
  });

  it('authorizes only the site owner by Vercel user ID, username, or owner email', () => {
    expect(
      isAuthorizedVercelUser({
        email: 'other@example.com',
        id: 'Zd6kYbHOXbM1fi2NHCmuSSDP',
      }),
    ).toBe(true);
    expect(
      isAuthorizedVercelUser({
        email: 'other@example.com',
        id: 'user_other',
        username: 'dgattey',
      }),
    ).toBe(true);
    expect(
      isAuthorizedVercelUser({
        email: 'dylan.gattey@gmail.com',
        id: 'user_other',
      }),
    ).toBe(true);
    expect(
      isAuthorizedVercelUser({
        email: 'stranger@example.com',
        id: 'user_stranger',
        username: 'stranger',
      }),
    ).toBe(false);
    expect(signSession({ email: 'stranger@example.com', id: 'user_stranger' })).toBeNull();
  });

  it('rejects tampered cookies', () => {
    const signed = signSession({ email: 'hi@dylangattey.com', id: 'x' });
    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(`${signed}tampered`)).toBeNull();
  });

  it('rejects expired cookies', () => {
    const issuedAt = 1_700_000_000_000;
    const signed = signSession({ email: 'hi@dylangattey.com', id: 'x' }, issuedAt);
    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(signed ?? undefined, issuedAt + 1_000)).toEqual({
      email: 'hi@dylangattey.com',
      id: 'x',
    });
    expect(
      parseVercelSessionCookie(signed ?? undefined, issuedAt + 31 * 24 * 60 * 60 * 1000),
    ).toBeNull();
  });

  it('requires a valid signed owner session in production and allows local dev without a cookie', () => {
    const signed = signSession({ email: 'hi@dylangattey.com', id: 'user_sub_123' });

    mockEnv({ NODE_ENV: 'production' });
    expect(isDevConsoleAccessAllowed(undefined)).toBe(false);
    expect(isDevConsoleAccessAllowed('invalid.cookie')).toBe(false);
    expect(isDevConsoleAccessAllowed(signed ?? undefined)).toBe(true);

    mockEnv({ NODE_ENV: 'development' });
    expect(isDevConsoleAccessAllowed(undefined)).toBe(true);
  });

  it('exports the session cookie name', () => {
    expect(VERCEL_SESSION_COOKIE).toBe('vercel_session');
  });
});
