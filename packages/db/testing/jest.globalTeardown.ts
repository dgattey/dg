/**
 * Global teardown for Jest tests.
 *
 * Note: This runs in a separate process from tests and globalSetup.
 * Test worker connections are closed by setupTestDatabase afterAll hooks.
 * This file is kept for any future cleanup needs but currently does nothing.
 */
export default async function globalTeardown() {
  // No-op: Each test worker closes its own DB connection via setupTestDatabase afterAll.
  // globalSetup closes its connection before exiting.
}
