import { maskSecrets, maskSecretValue } from '../maskSecrets';

describe('maskSecretValue', () => {
  it('returns null/undefined unchanged', () => {
    expect(maskSecretValue(null)).toBeNull();
    expect(maskSecretValue(undefined)).toBeUndefined();
  });

  it('returns empty string unchanged', () => {
    expect(maskSecretValue('')).toBe('');
  });

  it('masks short values entirely', () => {
    expect(maskSecretValue('abc')).toBe('***');
    expect(maskSecretValue('abcdef')).toBe('***');
  });

  it('shows first 3 and last 3 chars for longer values', () => {
    expect(maskSecretValue('abcdefghij')).toBe('abc...hij');
    expect(maskSecretValue('1234567890abc')).toBe('123...abc');
  });

  it('masks Bearer tokens', () => {
    expect(maskSecretValue('Bearer xyz123abc')).toBe('Bearer ***');
    expect(maskSecretValue('Got Bearer token123 from API')).toBe('Got Bearer *** from API');
  });

  it('masks JSON token patterns', () => {
    expect(maskSecretValue('{"access_token":"secret123"}')).toBe('{"access_token":"***"}');
    expect(maskSecretValue('{"refresh_token": "abc"}')).toBe('{"refresh_token":"***"}');
  });

  it('masks query string token patterns', () => {
    expect(maskSecretValue('url?access_token=secret123&foo=bar')).toBe(
      'url?access_token=***&foo=bar',
    );
  });
});

describe('maskSecrets', () => {
  it('returns null/undefined unchanged', () => {
    expect(maskSecrets(null)).toBeNull();
    expect(maskSecrets(undefined)).toBeUndefined();
  });

  it('returns primitives unchanged', () => {
    expect(maskSecrets(123)).toBe(123);
    expect(maskSecrets(true)).toBe(true);
    expect(maskSecrets('hello')).toBe('hello');
  });

  it('masks sensitive keys in objects', () => {
    expect(maskSecrets({ accessToken: 'secret123abc' })).toEqual({ accessToken: 'sec...abc' });
    expect(maskSecrets({ refreshToken: 'abcdefghij' })).toEqual({ refreshToken: 'abc...hij' });
    expect(maskSecrets({ password: 'mypassword1' })).toEqual({ password: 'myp...rd1' });
    expect(maskSecrets({ authorization: 'Bearer xyz' })).toEqual({ authorization: 'Bearer ***' });
    expect(maskSecrets({ secret: 'topsecret1' })).toEqual({ secret: 'top...et1' });
    expect(maskSecrets({ apiKey: 'key123456789' })).toEqual({ apiKey: 'key...789' });
    expect(maskSecrets({ code: 'authcode123' })).toEqual({ code: 'aut...123' });
  });

  it('does not mask non-sensitive keys', () => {
    expect(maskSecrets({ count: 5, name: 'test' })).toEqual({ count: 5, name: 'test' });
    expect(maskSecrets({ message: 'hello world' })).toEqual({ message: 'hello world' });
  });

  it('handles nested objects', () => {
    const input = {
      config: { enabled: true },
      user: { accessToken: 'secret123abc', name: 'test' },
    };
    expect(maskSecrets(input)).toEqual({
      config: { enabled: true },
      user: { accessToken: 'sec...abc', name: 'test' },
    });
  });

  it('handles arrays', () => {
    const input = [{ accessToken: 'secret123abc' }, { name: 'test' }];
    expect(maskSecrets(input)).toEqual([{ accessToken: 'sec...abc' }, { name: 'test' }]);
  });

  it('serializes Error objects without masking non-secret messages', () => {
    const error = new Error('Something failed');
    error.name = 'TestError';
    const result = maskSecrets(error) as { message: string; name: string; stack?: string };
    expect(result.message).toBe('Something failed');
    expect(result.name).toBe('TestError');
    expect(result.stack).toBeDefined();
  });

  it('masks secrets in Error messages', () => {
    const error = new Error('Failed with token access_token=secret123');
    const result = maskSecrets(error) as { message: string };
    expect(result.message).toBe('Failed with token access_token=***');
  });

  it('extracts status from Response-like objects', () => {
    const response = { body: 'large data', headers: {}, ok: true, status: 200 };
    expect(maskSecrets(response)).toEqual({ status: 200 });
  });

  it('handles URLSearchParams', () => {
    const params = new URLSearchParams();
    params.set('hub.verify_token', 'secret123abc');
    params.set('hub.mode', 'subscribe');
    expect(maskSecrets(params)).toEqual({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'sec...abc',
    });
  });

  it('handles mixed nested structures', () => {
    const input = {
      metadata: { count: 1 },
      tokens: [{ accessToken: 'secret123abc' }],
    };
    expect(maskSecrets(input)).toEqual({
      metadata: { count: 1 },
      tokens: [{ accessToken: 'sec...abc' }],
    });
  });
});
