import 'server-only';

import { timingSafeEqual } from 'node:crypto';
import { log } from '@dg/shared-core/logging/log';

type Query = Partial<Record<string, string | Array<string>>> | URLSearchParams;

const MODE_KEY = 'hub.mode';
const CHALLENGE_KEY = 'hub.challenge';
const VERIFY_KEY = 'hub.verify_token';
const VALID_MODE = 'subscribe';

const getQueryValue = (query: Query, key: string) => {
  if (query instanceof URLSearchParams) {
    return query.get(key) ?? undefined;
  }
  const value = query[key];
  return Array.isArray(value) ? value[0] : value;
};

const tokensMatchConstantTime = (
  verifyToken: string | undefined,
  expectedToken: string | undefined,
): boolean => {
  if (!verifyToken || !expectedToken) {
    return false;
  }
  const receivedBuffer = Buffer.from(verifyToken, 'utf8');
  const expectedBuffer = Buffer.from(expectedToken, 'utf8');
  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(receivedBuffer, expectedBuffer);
};

/**
 * Checks if a set of query params has a valid Strava subscription within
 * it. There may be MORE query params than present in the `StravaSubscription`
 * but at minimum we've got the subscription. As part of this check, it also
 * verifies that the STRAVA_VERIFY_TOKEN is actually the verify key that
 * Strava called us with.
 *
 * Note: We require an exact match for the verify token.
 */
const isSubscription = (query: Query) => {
  const mode = getQueryValue(query, MODE_KEY);
  const verifyToken = getQueryValue(query, VERIFY_KEY);
  const expectedToken = process.env.STRAVA_VERIFY_TOKEN?.trim();

  const modeMatches = mode === VALID_MODE;
  const tokenMatches = tokensMatchConstantTime(verifyToken, expectedToken);

  if (!modeMatches || !tokenMatches) {
    log.info('Strava challenge validation details', {
      hasExpectedToken: Boolean(expectedToken),
      hasReceivedToken: Boolean(verifyToken),
      modeMatches,
      modeReceived: mode,
      tokenMatches,
    });
  }

  return modeMatches && tokenMatches;
};

/**
 * To confirm a valid subscription, Strava requires you to respond to a
 * request with a 200 and the challenge code they give you.
 */
export const echoStravaChallengeIfValid = (query: Query): Record<string, string> | null => {
  if (!isSubscription(query)) {
    return null;
  }
  const challenge = getQueryValue(query, CHALLENGE_KEY);
  if (!challenge) {
    log.info('Strava challenge missing', {
      mode: getQueryValue(query, MODE_KEY),
    });
    return null;
  }
  return {
    [CHALLENGE_KEY]: challenge,
  };
};
