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

  it('round-trips a signed session', () => {
    const signed = signSession({
      email: 'owner@example.com',
      id: 'user_sub_123',
      name: 'Dylan',
    });

    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(signed ?? undefined)).toEqual({
      email: 'owner@example.com',
      id: 'user_sub_123',
      name: 'Dylan',
    });
  });

  it('authorizes only the site owner by username or SHA-256 user ID digest', () => {
    expect(
      isAuthorizedVercelUser({
        id: 'user_other',
        username: 'dgattey',
      }),
    ).toBe(true);
    expect(
      isAuthorizedVercelUser({
        id: 'user_other',
        username: 'DGATTEY',
      }),
    ).toBe(true);
    expect(
      isAuthorizedVercelUser({
        id: 'user_stranger',
        username: 'stranger',
      }),
    ).toBe(false);
    expect(isAuthorizedVercelUser({})).toBe(false);
  });

  it('rejects tampered cookies', () => {
    const signed = signSession({ email: 'owner@example.com', id: 'x' });
    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(`${signed}tampered`)).toBeNull();
  });

  it('rejects expired cookies', () => {
    const issuedAt = 1_700_000_000_000;
    const signed = signSession({ email: 'owner@example.com', id: 'x' }, issuedAt);
    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(signed ?? undefined, issuedAt + 1_000)).toEqual({
      email: 'owner@example.com',
      id: 'x',
    });
    expect(
      parseVercelSessionCookie(signed ?? undefined, issuedAt + 31 * 24 * 60 * 60 * 1000),
    ).toBeNull();
  });

  it('requires a valid signed owner session in production and allows local dev without a cookie', () => {
    const signed = signSession({ email: 'owner@example.com', id: 'user_sub_123' });

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
