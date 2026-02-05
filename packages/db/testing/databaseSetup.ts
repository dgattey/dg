import { closeDbConnection, db, dbClient } from '../client';

/**
 * Sets up test database lifecycle hooks for a test file.
 * Migrations are run once in globalSetup, not here.
 *
 * Each test is wrapped in a transaction (BEGIN/ROLLBACK) so changes are
 * invisible to other parallel workers and automatically cleaned up.
 * This requires `pool.max: 1` in the Sequelize config (set in dbConfig.ts
 * for test env) so that BEGIN and all subsequent queries share the same
 * physical connection.
 *
 * @example
 * ```ts
 * const db = setupTestDatabase();
 *
 * it('creates an activity', async () => {
 *   await db.StravaActivity.create({ ... });
 * });
 * ```
 */
export function setupTestDatabase() {
  beforeEach(async () => {
    await dbClient.query('BEGIN');
  });

  afterEach(async () => {
    await dbClient.query('ROLLBACK');
  });

  afterAll(async () => {
    await closeDbConnection();
  });

  return db;
}

/**
 * Resets the test database by truncating all tables.
 */
export async function resetTestDatabase(): Promise<void> {
  await dbClient.truncate({ cascade: true });
}

/**
 * Closes the test database connection.
 */
export async function closeTestDatabase(): Promise<void> {
  await closeDbConnection();
}
