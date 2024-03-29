type Query = Partial<Record<string, string | Array<string>>>;

const MODE_KEY = 'hub.mode';
const CHALLENGE_KEY = 'hub.challenge';
const VERIFY_KEY = 'hub.verify_token';
const VALID_MODE = 'subscribe';

/**
 * Strava calls the webhooks endpoint with this data in query params to create a subscription
 */
type StravaSubscription = {
  [MODE_KEY]: typeof VALID_MODE;
  [CHALLENGE_KEY]: string;
  [VERIFY_KEY]: string;
};

/**
 * Checks if a set of query params has a valid Strava subscription within
 * it. There may be MORE query params than present in the `StravaSubscription`
 * but at minimum we've got the subscription. As part of this typeguard, it also
 * verifies that the STRAVA_VERIFY_TOKEN is actually the verify key that
 * Strava called us with.
 */
const isSubscription = (query: Query): query is StravaSubscription =>
  query[MODE_KEY] === VALID_MODE && query[VERIFY_KEY] === process.env.STRAVA_VERIFY_TOKEN;

/**
 * To confirm a valid subscription, Strava requires you to respond to a
 * request with a 200 and the challenge code they give you. This function
 * returns true if the request's query has a validated Strava subscription
 * within it.
 */
export const echoStravaChallengeIfValid = (
  request: { query: Query },
  response: { status: (value: number) => { json: (value: Record<string, string>) => void } },
) => {
  const { query } = request;
  if (!isSubscription(query)) {
    return false;
  }
  response.status(200).json({
    [CHALLENGE_KEY]: query[CHALLENGE_KEY],
  });
  return true;
};
