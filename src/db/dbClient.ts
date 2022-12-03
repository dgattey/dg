import { env } from 'process';
import { Sequelize } from 'sequelize-typescript';
import Token from './models/Token';
import StravaActivity from './models/StravaActivity';

const databaseUrl = env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable not set');
}

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
});

/**
 * Ensures we can connect to the db properly, should be called on server startup.
 * Will throw an error if the connection fails. Won't run synchronously, so may
 * trigger an error a few seconds after startup.
 */
(() => dbClient.authenticate())();
