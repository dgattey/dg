import { invariant } from '@dg/shared-core/assertions/invariant';
import postgres from 'pg';
import type { SequelizeOptions } from 'sequelize-typescript';

type DbEnv = 'development' | 'production' | 'test';

const defaultServerlessPool = {
  pool: {
    evict: 1_000,
    idle: 1_000,
    max: 3,
    min: 0,
  },
};

const singleConnectionTestIsolationPool = { pool: { max: 1 } };

export const sequelizeOptions = {
  dialect: 'postgres',
  dialectModule: postgres,
  dialectOptions: {
    ssl: { rejectUnauthorized: true },
  },
  logging: false,
  ...(process.env.NODE_ENV === 'test' ? singleConnectionTestIsolationPool : defaultServerlessPool),
  ssl: true,
} satisfies SequelizeOptions;

export const cliOptionsByEnv = {
  development: { ...sequelizeOptions, use_env_variable: 'DATABASE_URL' },
  production: { ...sequelizeOptions, use_env_variable: 'DATABASE_URL' },
  test: { ...sequelizeOptions, use_env_variable: 'DATABASE_URL_TEST' },
};

const databaseUrls = {
  development: process.env.DATABASE_URL,
  production: process.env.DATABASE_URL,
  test: process.env.DATABASE_URL_TEST,
};

export function normalizeDatabaseUrl(rawUrl: string): string {
  if (rawUrl.includes('uselibpqcompat=')) {
    return rawUrl;
  }
  return rawUrl.replace(
    /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
    '$1sslmode=verify-full',
  );
}

export function getDatabaseUrl(): string {
  const nodeEnv = process.env.NODE_ENV ?? '';
  const url = databaseUrls[nodeEnv as DbEnv];
  invariant(url, `Database URL not set for NODE_ENV="${nodeEnv}"`);
  return normalizeDatabaseUrl(url);
}

export function getDatabaseUrlOrPlaceholder(): string {
  const nodeEnv = process.env.NODE_ENV ?? '';
  const url = databaseUrls[nodeEnv as DbEnv];
  return url ? normalizeDatabaseUrl(url) : 'postgresql://unconfigured.invalid:5432/dg';
}
