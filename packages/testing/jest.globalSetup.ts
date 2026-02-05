import { closeTestDatabase, resetTestDatabase } from './databaseSetup';
import { runMigrations } from './migrations';

/**
 * Global setup for Jest tests.
 * Sets up the test database with migrations and resets all tables.
 * Fails loudly if DATABASE_URL_TEST is not set.
 *
 * Note: This runs in a separate process from tests. Database connections
 * opened here are closed at the end of this function. Test workers open
 * their own connections which are closed by setupTestDatabase afterAll.
 */
export default async function globalSetup() {
  // Import db to trigger connection and validation
  const { dbClient } = await import('@dg/db');

  // Run migrations to ensure schema is up to date
  await runMigrations(dbClient);

  // Reset all tables for a clean test run
  await resetTestDatabase();

  // Close connection since this process exits after setup
  await closeTestDatabase();
}
