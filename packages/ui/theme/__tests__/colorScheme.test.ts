import { colorSchemeDeclaration, parseColorSchemePreference } from '../colorScheme';

describe('color scheme preference', () => {
  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'system'],
    [null, 'system'],
    [undefined, 'system'],
    ['invalid', 'system'],
  ] as const)('parses %s as %s', (raw, expected) => {
    expect(parseColorSchemePreference(raw)).toBe(expected);
  });

  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'light dark'],
  ] as const)('declares %s as %s', (preference, expected) => {
    expect(colorSchemeDeclaration(preference)).toBe(expected);
  });
});
