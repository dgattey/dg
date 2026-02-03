import { env } from 'node:process';
import { invariant } from '@dg/shared-core/helpers/invariant';
import { log } from '@dg/shared-core/helpers/log';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { isDbEnv, runtimeOptionsByEnv } from './dbConfig';
import { SpotifyPlay } from './models/SpotifyPlay';
import { StravaActivity } from './models/StravaActivity';
import { Token } from './models/Token';
import { fetchSpotifyHistoryRows } from './spotifyHistory';

const nodeEnv = env.NODE_ENV ?? '';
log.info('Node env', { nodeEnv });

invariant(
  isDbEnv(nodeEnv),
  `Invalid NODE_ENV: "${nodeEnv}". Must be one of: ${Object.keys(runtimeOptionsByEnv).join(', ')}`,
);

const databaseUrl = nodeEnv === 'test' ? env.DATABASE_URL_TEST : env.DATABASE_URL;
const databaseEnvLabel = nodeEnv === 'test' ? 'DATABASE_URL_TEST' : 'DATABASE_URL';
const maskedDatabaseUrl = databaseUrl ? `${databaseUrl.slice(0, 3)}...` : undefined;
log.info('Database url', { databaseEnvLabel, databaseUrl: maskedDatabaseUrl });
if (!databaseUrl) {
  throw new Error(`${databaseEnvLabel} environment variable not set`);
}

const DB_OPTIONS = runtimeOptionsByEnv[nodeEnv];

/**
 * These are all the models a user might possibly use
 */
export const db = {
  SpotifyPlay,
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

export { fetchSpotifyHistoryRows, Op };
