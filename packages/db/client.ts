import { env } from 'node:process';
import postgres from 'pg';
import { invariant } from '@dg/shared-core/assertions/invariant';
import { log } from '@dg/shared-core/logging/log';
import { Sequelize } from 'sequelize-typescript';
import { StravaActivity } from './models/StravaActivity';
import { Token } from './models/Token';

const SHARED_DB_OPTIONS = {
  dialect: 'postgres' as const,
  dialectModule: postgres, // gets around a Vercel bug where it's missing on edge functions
  dialectOptions: {
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
    ssl: true,
  },
};

const databaseUrl = env.DATABASE_URL;
const maskedDatabaseUrl = databaseUrl ? `${databaseUrl.slice(0, 3)}...` : undefined;
log.info('Database url', { databaseUrl: maskedDatabaseUrl });
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable not set');
}

const nodeEnv = env.NODE_ENV;
log.info('Node env', { nodeEnv });

// Sequelize options applied based on current environment
const dbOptionsByEnv = {
  development: SHARED_DB_OPTIONS,
  production: SHARED_DB_OPTIONS,
  test: SHARED_DB_OPTIONS,
};

const isDbEnv = (value: string): value is keyof typeof dbOptionsByEnv => value in dbOptionsByEnv;

invariant(
  nodeEnv && isDbEnv(nodeEnv),
  `Invalid NODE_ENV: "${nodeEnv}". Must be one of: ${Object.keys(dbOptionsByEnv).join(', ')}`,
);

const DB_OPTIONS = dbOptionsByEnv[nodeEnv];

/**
 * These are all the models a user might possibly use
 */
export const db = {
  StravaActivity,
  Token,
} as const;

/**
 * Actual db client instance, shouldn't be used directly but instead
 * through models.Something
 */
export const dbClient = new Sequelize(databaseUrl, {
  define: {
    freezeTableName: true,
  },
  models: Object.values(db),
  ...DB_OPTIONS,
});

/**
 * Ensures we can connect to the db properly, should be called on server startup.
 * Will throw an error if the connection fails. Won't run synchronously, so may
 * trigger an error a few seconds after startup.
 */
(() => dbClient.authenticate())();
