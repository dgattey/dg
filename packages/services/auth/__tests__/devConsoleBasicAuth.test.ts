import { mockEnv } from '@dg/testing/mocks';
import {
  hasDevConsoleCredentials,
  isDevConsoleAccessAllowed,
  isValidDevConsoleAuth,
} from '../devConsoleBasicAuth';

const encode = (username: string, password: string) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

describe('hasDevConsoleCredentials', () => {
  it('returns false when neither env var is set', () => {
    mockEnv({
      DEV_CONSOLE_BASIC_AUTH_PASS: undefined,
      DEV_CONSOLE_BASIC_AUTH_USER: undefined,
    });

    expect(hasDevConsoleCredentials()).toBe(false);
  });

  it('returns false when only username is set', () => {
    mockEnv({
      DEV_CONSOLE_BASIC_AUTH_PASS: undefined,
      DEV_CONSOLE_BASIC_AUTH_USER: 'dev',
    });

    expect(hasDevConsoleCredentials()).toBe(false);
  });

  it('returns false when only password is set', () => {
    mockEnv({
      DEV_CONSOLE_BASIC_AUTH_PASS: 'pass',
      DEV_CONSOLE_BASIC_AUTH_USER: undefined,
    });

    expect(hasDevConsoleCredentials()).toBe(false);
  });

  it('returns true when both env vars are set', () => {
    mockEnv({
      DEV_CONSOLE_BASIC_AUTH_PASS: 'pass',
      DEV_CONSOLE_BASIC_AUTH_USER: 'dev',
    });

    expect(hasDevConsoleCredentials()).toBe(true);
  });
});

describe('isValidDevConsoleAuth', () => {
  beforeEach(() => {
    mockEnv({
      DEV_CONSOLE_BASIC_AUTH_PASS: 'secret',
      DEV_CONSOLE_BASIC_AUTH_USER: 'admin',
    });
  });

  it('returns false for null header', () => {
    expect(isValidDevConsoleAuth(null)).toBe(false);
  });

  it('returns false for non-Basic header', () => {
    expect(isValidDevConsoleAuth('Bearer token123')).toBe(false);
  });

  it('returns false for empty Basic value', () => {
    expect(isValidDevConsoleAuth('Basic ')).toBe(false);
  });

  it('returns false for invalid base64', () => {
    expect(isValidDevConsoleAuth('Basic %%%invalid%%%')).toBe(false);
  });

  it('returns false for missing colon separator', () => {
    const noColon = `Basic ${btoa('justausername')}`;
    expect(isValidDevConsoleAuth(noColon)).toBe(false);
  });

  it('returns false for wrong username', () => {
    expect(isValidDevConsoleAuth(encode('wrong', 'secret'))).toBe(false);
  });

  it('returns false for wrong password', () => {
    expect(isValidDevConsoleAuth(encode('admin', 'wrong'))).toBe(false);
  });

  it('returns true for correct credentials', () => {
    expect(isValidDevConsoleAuth(encode('admin', 'secret'))).toBe(true);
  });

  it('handles passwords containing colons', () => {
    mockEnv({ DEV_CONSOLE_BASIC_AUTH_PASS: 'pass:with:colons' });

    expect(isValidDevConsoleAuth(encode('admin', 'pass:with:colons'))).toBe(true);
  });

  it('returns false when credentials are not configured', () => {
    mockEnv({
      DEV_CONSOLE_BASIC_AUTH_PASS: undefined,
      DEV_CONSOLE_BASIC_AUTH_USER: undefined,
    });

    expect(isValidDevConsoleAuth(encode('admin', 'secret'))).toBe(false);
  });
});

describe('isDevConsoleAccessAllowed', () => {
  describe('when credentials are configured', () => {
    beforeEach(() => {
      mockEnv({
        DEV_CONSOLE_BASIC_AUTH_PASS: 'secret',
        DEV_CONSOLE_BASIC_AUTH_USER: 'admin',
      });
    });

    it('returns true for valid credentials in development', () => {
      mockEnv({ NODE_ENV: 'development' });

      expect(isDevConsoleAccessAllowed(encode('admin', 'secret'))).toBe(true);
    });

    it('returns true for valid credentials in production', () => {
      mockEnv({ NODE_ENV: 'production' });

      expect(isDevConsoleAccessAllowed(encode('admin', 'secret'))).toBe(true);
    });

    it('returns false for missing credentials in development', () => {
      mockEnv({ NODE_ENV: 'development' });

      expect(isDevConsoleAccessAllowed(null)).toBe(false);
    });

    it('returns false for invalid credentials in development', () => {
      mockEnv({ NODE_ENV: 'development' });

      expect(isDevConsoleAccessAllowed(encode('admin', 'wrong'))).toBe(false);
    });

    it('returns false for missing credentials in production', () => {
      mockEnv({ NODE_ENV: 'production' });

      expect(isDevConsoleAccessAllowed(null)).toBe(false);
    });
  });

  describe('when credentials are not configured', () => {
    beforeEach(() => {
      mockEnv({
        DEV_CONSOLE_BASIC_AUTH_PASS: undefined,
        DEV_CONSOLE_BASIC_AUTH_USER: undefined,
      });
    });

    it('allows access in development', () => {
      mockEnv({ NODE_ENV: 'development' });

      expect(isDevConsoleAccessAllowed(null)).toBe(true);
    });

    it('allows access in test', () => {
      mockEnv({ NODE_ENV: 'test' });

      expect(isDevConsoleAccessAllowed(null)).toBe(true);
    });

    it('denies access in production', () => {
      mockEnv({ NODE_ENV: 'production' });

      expect(isDevConsoleAccessAllowed(null)).toBe(false);
    });
  });
});
