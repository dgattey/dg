import {
  applyColorSchemePreference,
  COLOR_SCHEME_ATTRIBUTE,
  COLOR_SCHEME_INIT_SCRIPT,
  COLOR_SCHEME_LEGACY_STORAGE_KEY,
  COLOR_SCHEME_STORAGE_KEY,
  parseColorSchemePreference,
  readStoredColorSchemePreference,
} from '../colorScheme';

/** Runs the exact source shipped to the browser, rather than a restatement of it. */
const runInitScript = () => {
  new Function(COLOR_SCHEME_INIT_SCRIPT)();
};

describe('color scheme preference', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

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

  it('reads an explicit preference back out of storage', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');

    expect(readStoredColorSchemePreference()).toBe('dark');
  });

  it('falls back to the legacy MUI key', () => {
    localStorage.setItem(COLOR_SCHEME_LEGACY_STORAGE_KEY, 'light');

    expect(readStoredColorSchemePreference()).toBe('light');
  });

  it('defaults to system when storage throws', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(readStoredColorSchemePreference()).toBe('system');

    jest.restoreAllMocks();
  });

  it.each(['light', 'dark'] as const)('applies %s to the root attribute', (preference) => {
    applyColorSchemePreference(preference);

    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, preference);
  });

  it('clears the attribute for the system preference', () => {
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    applyColorSchemePreference('system');

    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
  });
});

describe('color scheme init script', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it.each(['light', 'dark'] as const)('applies a stored %s preference', (preference) => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, preference);

    runInitScript();

    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, preference);
  });

  it('honors the legacy MUI key', () => {
    localStorage.setItem(COLOR_SCHEME_LEGACY_STORAGE_KEY, 'dark');

    runInitScript();

    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
  });

  it.each(['system', 'nonsense', ''])('leaves the root alone for %s', (stored) => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, stored);

    runInitScript();

    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it('stays silent when storage is unavailable', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    expect(runInitScript).not.toThrow();
    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);

    jest.restoreAllMocks();
  });
});
