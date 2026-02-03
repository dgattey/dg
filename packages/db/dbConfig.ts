import postgres from 'pg';
import type { SequelizeOptions } from 'sequelize-typescript';

export type DbEnv = 'development' | 'production' | 'test';

const baseOptions = {
  dialect: 'postgres',
  dialectModule: postgres,
} satisfies Pick<SequelizeOptions, 'dialect' | 'dialectModule'>;

const runtimeDialectOptions = {
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
    },
  },
  ssl: true,
};

const runtimeOptions = {
  ...baseOptions,
  dialectOptions: runtimeDialectOptions,
} satisfies SequelizeOptions;

export const runtimeOptionsByEnv: Record<DbEnv, SequelizeOptions> = {
  development: runtimeOptions,
  production: runtimeOptions,
  test: runtimeOptions,
};

const cliDialectOptions = {
  ssl: {
    rejectUnauthorized: false,
    require: true,
  },
};

export const cliOptionsByEnv = {
  development: {
    ...baseOptions,
    dialectOptions: cliDialectOptions,
    use_env_variable: 'DATABASE_URL',
  },
  production: {
    ...baseOptions,
    dialectOptions: cliDialectOptions,
    use_env_variable: 'DATABASE_URL',
  },
  test: {
    ...baseOptions,
    dialectOptions: cliDialectOptions,
    use_env_variable: 'DATABASE_URL_TEST',
  },
};

const dbEnvironments: Array<DbEnv> = ['development', 'production', 'test'];

export const isDbEnv = (value: string): value is DbEnv =>
  dbEnvironments.some((env) => env === value);
