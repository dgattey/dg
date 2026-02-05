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
