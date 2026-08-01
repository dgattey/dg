import { parseStravaError } from '../parseStravaError';

const stravaBody = (code: string, resource = 'Application') =>
  JSON.stringify({ errors: [{ code, field: 'Status', resource }], message: 'Forbidden' });

describe('parseStravaError', () => {
  it('explains an inactive application', () => {
    expect(parseStravaError(403, stravaBody('Inactive'))).toBe(
      'The Strava application is inactive. Reactivate it in your Strava API settings to manage webhooks.',
    );
  });

  it('explains a duplicate subscription', () => {
    expect(parseStravaError(400, stravaBody('already exists', 'PushSubscription'))).toBe(
      'A webhook subscription already exists for this app. Delete the existing subscription first.',
    );
  });

  it('points at the tunnel when Strava cannot reach the callback', () => {
    const body = stravaBody('GET to callback URL does not return 200', 'PushSubscription');

    expect(parseStravaError(400, body, 'https://example.com/api/webhooks')).toContain(
      'https://example.com/api/webhooks',
    );
  });

  it('blames credentials for an unexplained 403', () => {
    expect(parseStravaError(403, '')).toBe(
      'Invalid Strava client credentials. Check STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET.',
    );
  });

  it('falls back to the status and body', () => {
    expect(parseStravaError(503, 'gateway down')).toBe('Strava returned 503: gateway down');
  });

  it('survives a body that is not JSON', () => {
    expect(parseStravaError(500, '<html>nope</html>')).toBe(
      'Strava returned 500: <html>nope</html>',
    );
  });
});
