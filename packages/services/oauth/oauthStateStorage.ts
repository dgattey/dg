import 'server-only';

import { db, Op } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';

/**
 * Maximum age for OAuth state (5 minutes).
 * OAuth flows should complete within this time.
 */
const OAUTH_STATE_MAX_AGE_MS = 5 * 60 * 1000;

type SaveOauthStateParams = {
  state: string;
  provider: string;
  codeVerifier: string | undefined;
};

/**
 * Saves OAuth state to the database for validation during callback.
 * This replaces cookie-based storage to avoid domain mismatch issues with tunnels.
 */
export async function saveOauthState({
  state,
  provider,
  codeVerifier,
}: SaveOauthStateParams): Promise<void> {
  const expiresAt = new Date(Date.now() + OAUTH_STATE_MAX_AGE_MS);

  await db.OauthState.create({
    codeVerifier,
    expiresAt,
    provider,
    state,
  });

  log.info('Saved OAuth state to database', {
    provider,
    statePrefix: state.slice(0, 8),
  });
}

type RetrievedOauthState = {
  provider: string;
  codeVerifier: string | undefined;
};

/**
 * Retrieves and validates OAuth state from the database.
 * Returns null if state doesn't exist or is expired.
 * Deletes the state after retrieval (one-time use).
 */
export async function retrieveAndDeleteOauthState(
  state: string,
): Promise<RetrievedOauthState | null> {
  const record = await db.OauthState.findByPk(state);

  if (!record) {
    log.warn('OAuth state not found in database', {
      statePrefix: state.slice(0, 8),
    });
    return null;
  }

  // Delete immediately (one-time use)
  await record.destroy();

  // Check if expired
  if (record.expiresAt < new Date()) {
    log.warn('OAuth state expired', {
      expiresAt: record.expiresAt,
      statePrefix: state.slice(0, 8),
    });
    return null;
  }

  log.info('Retrieved OAuth state from database', {
    provider: record.provider,
    statePrefix: state.slice(0, 8),
  });

  return {
    codeVerifier: record.codeVerifier,
    provider: record.provider,
  };
}

/**
 * Cleans up expired OAuth states from the database.
 * Call periodically to prevent table bloat from abandoned OAuth flows.
 */
export async function cleanupExpiredOauthStates(): Promise<number> {
  const deleted = await db.OauthState.destroy({
    where: {
      expiresAt: {
        [Op.lt]: new Date(),
      },
    },
  });

  if (deleted > 0) {
    log.info('Cleaned up expired OAuth states', { count: deleted });
  }

  return deleted;
}
