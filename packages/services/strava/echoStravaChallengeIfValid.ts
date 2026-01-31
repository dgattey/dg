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
 */
const isSubscription = (query: Query) =>
  getQueryValue(query, MODE_KEY) === VALID_MODE &&
  getQueryValue(query, VERIFY_KEY) === process.env.STRAVA_VERIFY_TOKEN;

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
