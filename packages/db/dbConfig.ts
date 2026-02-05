import { invariant } from '@dg/shared-core/assertions/invariant';
import postgres from 'pg';
import type { SequelizeOptions } from 'sequelize-typescript';

type DbEnv = 'development' | 'production' | 'test';

// Shared options for all environments - unified SSL
export const sequelizeOptions = {
  dialect: 'postgres',
  dialectModule: postgres,
  dialectOptions: {
    ssl: { rejectUnauthorized: true },
  },
  // In test, limit pool to 1 connection per worker so that each test's
  // wrapping BEGIN/ROLLBACK transaction covers every query on the same
  // physical connection, providing full isolation between parallel workers.
  ...(process.env.NODE_ENV === 'test' && { pool: { max: 1 } }),
  ssl: true,
} satisfies SequelizeOptions;

// CLI options - adds use_env_variable for Sequelize CLI
export const cliOptionsByEnv = {
  development: { ...sequelizeOptions, use_env_variable: 'DATABASE_URL' },
  production: { ...sequelizeOptions, use_env_variable: 'DATABASE_URL' },
  test: { ...sequelizeOptions, use_env_variable: 'DATABASE_URL_TEST' },
};

// Database URLs by environment
const databaseUrls = {
  development: process.env.DATABASE_URL,
  production: process.env.DATABASE_URL,
  test: process.env.DATABASE_URL_TEST,
};

// Get database URL - fails loudly if not configured
export function getDatabaseUrl(): string {
  const nodeEnv = process.env.NODE_ENV ?? '';
  const url = databaseUrls[nodeEnv as DbEnv];
  invariant(url, `Database URL not set for NODE_ENV="${nodeEnv}"`);
  return url;
}

// Default export for Sequelize CLI (database.config.mts)
const dbConfig = {
  cliOptionsByEnv,
};

export default dbConfig;
