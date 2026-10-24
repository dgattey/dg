import { invariant } from '@dg/shared-core/assertions/invariant';
import postgres from 'pg';
import type { SequelizeOptions } from 'sequelize-typescript';

type DbEnv = 'development' | 'production' | 'test';

const defaultServerlessPool = {
  pool: {
    acquire: 8_000,
    evict: 1_000,
    idle: 1_000,
    max: 3,
    min: 0,
  },
};

const singleConnectionTestIsolationPool = { pool: { max: 1 } };

function getRawDatabaseUrl(env = process.env.NODE_ENV || 'development'): string | undefined {
  switch (env as DbEnv) {
    case 'development':
    case 'production':
      return process.env.DATABASE_URL;
    case 'test':
      return process.env.DATABASE_URL_TEST;
    default:
      return process.env.DATABASE_URL;
  }
}

export function isSslDisabledUrl(rawUrl: string | undefined): boolean {
  if (!rawUrl) {
    return false;
  }
  return (
    /[?&]sslmode=disable(?=&|$)/i.test(rawUrl) ||
    /^postgres(?:ql)?:\/\/(?:[^@]*@)?(?:localhost|127\.0\.0\.1)(?::|\/|\?|$)/i.test(rawUrl)
  );
}

function buildSequelizeOptions(rawUrl: string | undefined, isTest = false) {
  const disableSsl = isSslDisabledUrl(rawUrl);
  return {
    dialect: 'postgres' as const,
    dialectModule: postgres,
    dialectOptions: {
      connectionTimeoutMillis: 5_000,
      query_timeout: 15_000,
      statement_timeout: 15_000,
      ...(disableSsl ? {} : { ssl: { rejectUnauthorized: true } }),
    },
    logging: false,
    ...(isTest ? singleConnectionTestIsolationPool : defaultServerlessPool),
    ssl: !disableSsl,
  } satisfies SequelizeOptions;
}

export const sequelizeOptions = buildSequelizeOptions(
  getRawDatabaseUrl(),
  process.env.NODE_ENV === 'test',
);

export const cliOptionsByEnv = {
  development: {
    ...buildSequelizeOptions(process.env.DATABASE_URL, false),
    use_env_variable: 'DATABASE_URL',
  },
  production: {
    ...buildSequelizeOptions(process.env.DATABASE_URL, false),
    use_env_variable: 'DATABASE_URL',
  },
  test: {
    ...buildSequelizeOptions(process.env.DATABASE_URL_TEST, true),
    use_env_variable: 'DATABASE_URL_TEST',
  },
};

export function normalizeDatabaseUrl(rawUrl: string): string {
  if (rawUrl.includes('uselibpqcompat=') || isSslDisabledUrl(rawUrl)) {
    return rawUrl;
  }
  return rawUrl.replace(
    /([?&])sslmode=(?:prefer|require|verify-ca)(?=&|$)/,
    '$1sslmode=verify-full',
  );
}

export function getDatabaseUrl(): string {
  const nodeEnv = process.env.NODE_ENV ?? '';
  const url = getRawDatabaseUrl(nodeEnv);
  invariant(url, `Database URL not set for NODE_ENV="${nodeEnv}"`);
  return normalizeDatabaseUrl(url);
}

export function getDatabaseUrlOrPlaceholder(): string {
  const nodeEnv = process.env.NODE_ENV ?? '';
  const url = getRawDatabaseUrl(nodeEnv);
  return url ? normalizeDatabaseUrl(url) : 'postgresql://unconfigured.invalid:5432/dg';
}
