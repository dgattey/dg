import { timingSafeEqualStrings } from '../devConsoleBasicAuth';

describe('timingSafeEqualStrings', () => {
  it('returns false when either value is null, undefined, or empty', () => {
    expect(timingSafeEqualStrings(null, 'secret')).toBe(false);
    expect(timingSafeEqualStrings('secret', null)).toBe(false);
    expect(timingSafeEqualStrings(undefined, 'secret')).toBe(false);
    expect(timingSafeEqualStrings('', 'secret')).toBe(false);
    expect(timingSafeEqualStrings('', '')).toBe(false);
  });

  it('returns true for identical strings and false for prefixes, suffixes, or mismatches', () => {
    expect(timingSafeEqualStrings('secret-token', 'secret-token')).toBe(true);
    expect(timingSafeEqualStrings('pass:with:colons', 'pass:with:colons')).toBe(true);
    expect(timingSafeEqualStrings('secret', 'secret-extended')).toBe(false);
    expect(timingSafeEqualStrings('secret-extended', 'secret')).toBe(false);
    expect(timingSafeEqualStrings('secret-a', 'secret-b')).toBe(false);
  });
});
