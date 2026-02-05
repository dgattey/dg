/**
 * Sets up mock clearing/restoring lifecycle.
 * Call at top level of describe block.
 */
export function setupMockLifecycle(): void {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
}

/**
 * Replaces `process.env` with the current values merged with the given
 * overrides. Jest automatically restores the original after each test.
 * Use `undefined` values to simulate missing env vars.
 */
export function mockEnv(overrides: Record<string, string | undefined>): void {
  jest.replaceProperty(process, 'env', { ...process.env, ...overrides });
}
