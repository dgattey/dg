import { TextDecoder, TextEncoder } from 'node:util';

globalThis.TextDecoder ??= TextDecoder;
globalThis.TextEncoder ??= TextEncoder;

/**
 * Global setup for Jest tests.
 * Sets up the test database with migrations and resets all tables.
 * Fails loudly if DATABASE_URL_TEST is not set.
 */
export default async function globalSetup() {
  const { setupTestDatabase, resetTestDatabase } = await import(
    '@dg/services/testing/setupTestDatabase'
  );

  // This will fail loudly if DATABASE_URL_TEST is not set
  await setupTestDatabase();

  // Reset all tables for a clean test run
  await resetTestDatabase();
}
