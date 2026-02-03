import { log } from '@dg/shared-core/helpers/log';

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

/**
 * Checks if a set of query params has a valid Strava subscription within
 * it. There may be MORE query params than present in the `StravaSubscription`
 * but at minimum we've got the subscription. As part of this check, it also
 * verifies that the STRAVA_VERIFY_TOKEN is actually the verify key that
 * Strava called us with.
 *
 * Note: Strava's API has a bug where it truncates verify_token at the first
 * '&' character, even when properly URL-encoded. To work around this, we
 * also accept the token prefix up to the first '&'.
 */
const isSubscription = (query: Query) => {
  const mode = getQueryValue(query, MODE_KEY);
  const verifyToken = getQueryValue(query, VERIFY_KEY);
  const expectedToken = process.env.STRAVA_VERIFY_TOKEN;

  const modeMatches = mode === VALID_MODE;

  // Strava truncates at '&' even when URL-encoded, so also accept the prefix
  const expectedTokenPrefix = expectedToken?.split('&')[0];
  const tokenMatches = verifyToken === expectedToken || verifyToken === expectedTokenPrefix;

  if (!modeMatches || !tokenMatches) {
    log.info('Strava challenge validation details', {
      modeMatches,
      modeReceived: mode,
      tokenExpectedPrefix: expectedTokenPrefix?.slice(0, 8),
      tokenMatches,
      // Only log first/last few chars for security
      tokenReceivedPrefix: verifyToken?.slice(0, 8),
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
    return null;
  }
  return {
    [CHALLENGE_KEY]: challenge,
  };
};
