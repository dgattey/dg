import 'server-only';

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

const describeToken = (token: string | undefined | null) => {
  if (!token) {
    return { hasNonAlnum: false, length: 0, prefix: undefined, suffix: undefined };
  }
  return {
    hasNonAlnum: /[^A-Za-z0-9]/.test(token),
    length: token.length,
    prefix: token.slice(0, 4),
    suffix: token.slice(-4),
  };
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
  const expectedToken = process.env.STRAVA_VERIFY_TOKEN;

  const modeMatches = mode === VALID_MODE;

  const tokenMatches = verifyToken === expectedToken;

  if (!modeMatches || !tokenMatches) {
    log.info('Strava challenge validation details', {
      modeMatches,
      modeReceived: mode,
      tokenExpected: describeToken(expectedToken),
      tokenMatches,
      // Only log first/last few chars for security
      tokenReceived: describeToken(verifyToken),
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
      tokenReceived: describeToken(getQueryValue(query, VERIFY_KEY)),
    });
    return null;
  }
  return {
    [CHALLENGE_KEY]: challenge,
  };
};
