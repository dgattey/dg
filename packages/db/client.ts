import { log } from '@dg/shared-core/logging/log';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { getDatabaseUrl, sequelizeOptions } from './dbConfig';
import { OauthState } from './models/OauthState';
import { SpotifyPlay } from './models/SpotifyPlay';
import { StravaActivity } from './models/StravaActivity';
import { Token } from './models/Token';

// Models
export const db = {
  OauthState,
  SpotifyPlay,
  StravaActivity,
  Token,
} as const;

// Client
export const dbClient = new Sequelize(getDatabaseUrl(), {
  define: { freezeTableName: true },
  models: Object.values(db),
  ...sequelizeOptions,
});

export { Op };

/**
 * Verify database connection. Call on app startup.
 */
export async function connectToDatabase(): Promise<void> {
  await dbClient.authenticate();
  log.info('Database connected');
}

/**
 * Close database connection. Safe to call multiple times.
 */
export async function closeDbConnection(): Promise<void> {
  try {
    await dbClient.close();
  } catch {
    // Ignore - may already be closed
  }
}

// Auto-connect in non-test environments
if (process.env.NODE_ENV !== 'test') {
  connectToDatabase();
}
