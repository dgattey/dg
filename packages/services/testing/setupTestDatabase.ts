import { setupTestDatabase as setupDb } from '@dg/testing/databaseSetup';

type SetupOptions = Parameters<typeof setupDb>[0];

export function setupTestDatabase(options?: SetupOptions) {
  return setupDb(options);
}
