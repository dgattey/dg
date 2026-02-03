import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { invariant } from '@dg/shared-core/helpers/invariant';
import { log } from '@dg/shared-core/helpers/log';

/**
 * Ensures NODE_ENV is set to 'test'. Fails loudly if not.
 */
const ensureTestEnv = () => {
  invariant(process.env.NODE_ENV === 'test', 'Test database helpers require NODE_ENV=test.');
};

/**
 * Ensures DATABASE_URL_TEST is set. Fails loudly if not.
 */
const ensureDatabaseUrlTest = () => {
  invariant(
    process.env.DATABASE_URL_TEST,
    'DATABASE_URL_TEST environment variable is required for tests. ' +
      'Set it to your test database connection string.',
  );
};

/**
 * Validates that the test environment is properly configured.
 * Fails loudly if DATABASE_URL_TEST is not set or NODE_ENV is not 'test'.
 */
const ensureTestDbConfig = () => {
  ensureTestEnv();
  ensureDatabaseUrlTest();
};

/**
 * Runs all pending migrations on the test database.
 * Uses Sequelize QueryInterface directly to avoid Umzug dependency.
 */
async function runMigrations(dbClient: import('sequelize-typescript').Sequelize) {
  const Sequelize = await import('sequelize');
  const queryInterface = dbClient.getQueryInterface();

  // Create SequelizeMeta table if it doesn't exist
  await queryInterface.createTable(
    'SequelizeMeta',
    {
      name: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.STRING,
      },
    },
    { ifNotExists: true } as Parameters<typeof queryInterface.createTable>[2],
  );

  // Get already-run migrations
  const [executedMigrations] = (await dbClient.query(
    'SELECT name FROM "SequelizeMeta"',
  )) as unknown as [[{ name: string }]];
  const executedNames = new Set(executedMigrations.map((m) => m.name));

  // Find migration files
  const migrationsDir = join(import.meta.dirname, 'migrations');
  const migrationFiles = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();

  // Run pending migrations
  for (const file of migrationFiles) {
    if (executedNames.has(file)) {
      continue;
    }

    log.info(`Running migration: ${file}`);
    const migrationPath = join(migrationsDir, file);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const migration = require(migrationPath) as {
      up: (
        queryInterface: import('sequelize').QueryInterface,
        Sequelize: typeof import('sequelize'),
      ) => Promise<void>;
    };
    await migration.up(queryInterface, Sequelize);
    await dbClient.query('INSERT INTO "SequelizeMeta" (name) VALUES (?)', {
      replacements: [file],
    });
  }
}

let dbInstance: typeof import('./client').db | null = null;
let dbClientInstance: import('sequelize-typescript').Sequelize | null = null;

/**
 * Sets up the test database for use in tests. This is a one-liner that:
 * 1. Validates DATABASE_URL_TEST is set (fails loudly if not)
 * 2. Validates NODE_ENV is 'test' (fails loudly if not)
 * 3. Runs any pending migrations
 * 4. Returns the db object for querying
 *
 * Call this once in your test file (e.g., in beforeAll) to get the db object.
 *
 * @example
 * ```ts
 * // In apps/*, import from services:
 * import { setupTestDatabase } from '@dg/services/testing/setupTestDatabase';
 * // In packages/services, import directly:
 * import { setupTestDatabase } from '@dg/db/testing';
 *
 * let db: Awaited<ReturnType<typeof setupTestDatabase>>;
 *
 * beforeAll(async () => {
 *   db = await setupTestDatabase();
 * });
 *
 * beforeEach(async () => {
 *   await db.SpotifyPlay.destroy({ truncate: true });
 * });
 * ```
 */
export async function setupTestDatabase() {
  ensureTestDbConfig();

  // Lazy import to avoid loading db client when not needed
  const { db, dbClient } = await import('./client');
  dbInstance = db;
  dbClientInstance = dbClient;

  // Run migrations to ensure schema is up to date
  await runMigrations(dbClient);

  return db;
}

/**
 * Resets the test database by truncating all tables.
 * Use this in globalSetup or beforeEach to start with a clean slate.
 */
export async function resetTestDatabase() {
  ensureTestDbConfig();

  if (!dbClientInstance) {
    const { dbClient } = await import('./client');
    dbClientInstance = dbClient;
  }

  await dbClientInstance.truncate({ cascade: true });
}

/**
 * Closes the test database connection.
 * Use this in globalTeardown or afterAll to clean up.
 */
export async function closeTestDatabase() {
  ensureTestDbConfig();

  if (!dbClientInstance) {
    return;
  }

  await dbClientInstance.close();
  dbClientInstance = null;
  dbInstance = null;
}

/**
 * Gets the db object if setupTestDatabase has been called.
 * Throws if called before setup.
 */
export function getTestDb() {
  ensureTestDbConfig();
  invariant(dbInstance, 'Test database not initialized. Call setupTestDatabase() first.');
  return dbInstance;
}
