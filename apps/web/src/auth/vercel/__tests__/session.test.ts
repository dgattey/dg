/**
 * @jest-environment node
 */

import {
  entitiesFromSessionCookie,
  parseVercelSessionCookie,
  signSession,
  VERCEL_SESSION_COOKIE,
} from '../session';

describe('Vercel session cookie', () => {
  const originalSecret = process.env.VERCEL_APP_CLIENT_SECRET;

  beforeEach(() => {
    process.env.VERCEL_APP_CLIENT_SECRET = 'test-vercel-client-secret';
  });

  afterEach(() => {
    process.env.VERCEL_APP_CLIENT_SECRET = originalSecret;
  });

  it('round-trips a signed session', () => {
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

  it('rejects tampered cookies', () => {
    const signed = signSession({ email: 'a@b.com', id: 'x' });
    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(`${signed}tampered`)).toBeNull();
  });

  it('rejects expired cookies', () => {
    const issuedAt = 1_700_000_000_000;
    const signed = signSession({ email: 'a@b.com', id: 'x' }, issuedAt);
    expect(signed).toBeTruthy();
    expect(parseVercelSessionCookie(signed ?? undefined, issuedAt + 1_000)).toEqual({
      email: 'a@b.com',
      id: 'x',
    });
    expect(
      parseVercelSessionCookie(signed ?? undefined, issuedAt + 31 * 24 * 60 * 60 * 1000),
    ).toBeNull();
  });

  it('returns empty entities when cookie is absent', () => {
    expect(entitiesFromSessionCookie(undefined)).toEqual({});
  });

  it('returns user entities when cookie is present', () => {
    const signed = signSession({ email: 'hi@dylangattey.com', id: 'user_sub_123' });
    expect(entitiesFromSessionCookie(signed ?? undefined)).toEqual({
      user: { email: 'hi@dylangattey.com', id: 'user_sub_123' },
    });
  });

  it('exports the cookie name used by identify', () => {
    expect(VERCEL_SESSION_COOKIE).toBe('vercel_flags_session');
  });
});
