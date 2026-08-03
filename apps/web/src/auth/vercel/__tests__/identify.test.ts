/**
 * @jest-environment node
 */

jest.mock('@flags-sdk/vercel', () => ({
  vercelAdapter: {},
}));

jest.mock('flags/next', () => ({
  dedupe: <T>(fn: T) => fn,
  flag: <T>(definition: T) => definition,
}));

import type { ReadonlyRequestCookies } from 'flags';
import { identify } from '../../../flags';
import { signSession, VERCEL_SESSION_COOKIE } from '../../vercel/session';

function cookiesFromRecord(record: Record<string, string>): ReadonlyRequestCookies {
  return {
    get: (name: string) => {
      const value = record[name];
      return value === undefined ? undefined : { name, value };
    },
  } as unknown as ReadonlyRequestCookies;
}

describe('Flags identify', () => {
  const originalSecret = process.env.VERCEL_APP_CLIENT_SECRET;

  beforeEach(() => {
    process.env.VERCEL_APP_CLIENT_SECRET = 'test-vercel-client-secret';
  });

  afterEach(() => {
    process.env.VERCEL_APP_CLIENT_SECRET = originalSecret;
  });

  it('returns user when the session cookie is present', () => {
    const signed = signSession({ email: 'hi@dylangattey.com', id: 'user_sub_123' });
    expect(signed).toBeTruthy();

    const entities = identify({
      cookies: cookiesFromRecord({ [VERCEL_SESSION_COOKIE]: signed as string }),
    });

    expect(entities).toEqual({
      user: { email: 'hi@dylangattey.com', id: 'user_sub_123' },
    });
  });

  it('returns empty entities when the session cookie is absent', () => {
    const entities = identify({
      cookies: cookiesFromRecord({}),
    });

    expect(entities).toEqual({});
  });
});
