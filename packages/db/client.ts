import { env } from 'node:process';
import { Sequelize } from 'sequelize-typescript';
import postgres from 'pg';
import { log } from '@logtail/next';
import { Token } from './models/Token';
import { StravaActivity } from './models/StravaActivity';

const SHARED_DB_OPTIONS = {
  dialect: 'postgres' as const,
  dialectModule: postgres, // gets around a Vercel bug where it's missing on edge functions
  dialectOptions: {
    ssl: true,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
  },
};

const databaseUrl = env.DATABASE_URL;
log.info('Database url', { databaseUrl });
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable not set');
}

const nodeEnv = env.NODE_ENV;
log.info('Node env from env variable', { nodeEnv });

// Sequelize options applied based on current environment
const DB_OPTIONS = {
  development: SHARED_DB_OPTIONS,
  test: SHARED_DB_OPTIONS,
  production: SHARED_DB_OPTIONS,
}[nodeEnv];

/**
 * These are all the models a user might possibly use
 */
export const db = {
  Token,
  StravaActivity,
} as const;

/**
 * Actual db client instance, shouldn't be used directly but instead
 * through models.Something
 */
export const dbClient = new Sequelize(databaseUrl, {
  models: Object.values(db),
  define: {
    freezeTableName: true,
  },
  ...DB_OPTIONS,
});

/**
 * Ensures we can connect to the db properly, should be called on server startup.
 * Will throw an error if the connection fails. Won't run synchronously, so may
 * trigger an error a few seconds after startup.
 */
(() => dbClient.authenticate())();
