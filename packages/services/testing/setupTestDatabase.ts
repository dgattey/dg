/**
 * Test database setup utilities.
 *
 * Re-exports from @dg/db/testing to allow tests to import from @dg/services
 * while keeping the actual database logic centralized.
 *
 * @example
 * ```ts
 * import { setupTestDatabase } from '@dg/services/testing/setupTestDatabase';
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

import { Op as _Op } from '@dg/db';
import {
  closeTestDatabase as _closeTestDatabase,
  getTestDb as _getTestDb,
  resetTestDatabase as _resetTestDatabase,
  setupTestDatabase as _setupTestDatabase,
} from '@dg/db/testing';

/**
 * Sets up the test database. Fails loudly if DATABASE_URL_TEST is not set.
 * Runs migrations and returns the db object.
 */
export const setupTestDatabase = _setupTestDatabase;

/**
 * Resets the test database by truncating all tables.
 */
export const resetTestDatabase = _resetTestDatabase;

/**
 * Closes the test database connection.
 */
export const closeTestDatabase = _closeTestDatabase;

/**
 * Gets the db object if setupTestDatabase has been called.
 */
export const getTestDb = _getTestDb;

/**
 * Re-export Sequelize Op for use in test queries.
 */
export const Op = _Op;
