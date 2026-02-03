import { TextDecoder, TextEncoder } from 'node:util';

globalThis.TextDecoder ??= TextDecoder;
globalThis.TextEncoder ??= TextEncoder;

/**
 * Global teardown for Jest tests.
 * Closes the test database connection.
 */
export default async function globalTeardown() {
  const { closeTestDatabase } = await import('@dg/services/testing/setupTestDatabase');
  await closeTestDatabase();
}
