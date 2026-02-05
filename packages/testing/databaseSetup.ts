import { closeDbConnection, db, dbClient } from '@dg/db';

type ModelName = keyof typeof db;

interface SetupOptions {
  /** Models to truncate in beforeEach */
  truncate?: Array<ModelName>;
}

async function truncateModel(modelName: ModelName): Promise<void> {
  const model = dbClient.model(modelName);
  await model.destroy({ cascade: true, truncate: true, where: {} });
}

/**
 * Sets up test database lifecycle hooks for a test file.
 * Migrations are run once in globalSetup, not here.
 *
 * @example
 * ```ts
 * const db = setupTestDatabase({ truncate: ['StravaActivity'] });
 *
 * it('creates an activity', async () => {
 *   await db.StravaActivity.create({ ... });
 * });
 * ```
 */
export function setupTestDatabase(options?: SetupOptions) {
  const truncateModels = options?.truncate;
  if (truncateModels?.length) {
    beforeEach(async () => {
      for (const model of truncateModels) {
        await truncateModel(model);
      }
    });
  }

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
