import { log } from '@dg/shared-core/logging/log';
import { mockEnv, setupMockLifecycle } from '@dg/testing/mocks';
import { getWebhookSubscriptions } from '../getWebhookSubscriptions';

/** The body Strava returns once an application is switched off. */
const INACTIVE_APPLICATION_BODY = JSON.stringify({
  errors: [{ code: 'Inactive', field: 'Status', resource: 'Application' }],
  message: 'Forbidden',
});

const mockFetchResponse = (status: number, body: string) => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(body, {
      headers: { 'Content-Type': 'application/json' },
      status,
    }),
  );
};

describe('getWebhookSubscriptions', () => {
  setupMockLifecycle();

  beforeEach(() => {
    mockEnv({ STRAVA_CLIENT_ID: 'client-id', STRAVA_CLIENT_SECRET: 'client-secret' });
    jest.spyOn(log, 'error').mockImplementation(() => undefined);
  });

  it('returns subscription metadata without ids when Strava answers', async () => {
    mockFetchResponse(
      200,
      JSON.stringify([
        {
          application_id: 1,
          callback_url: 'https://example.com/api/webhooks',
          created_at: '2026-01-01T00:00:00Z',
          id: 42,
          resource_state: 2,
        },
      ]),
    );

    const status = await getWebhookSubscriptions();

    expect(status).toEqual({
      error: null,
      subscriptions: [
        { callbackUrl: 'https://example.com/api/webhooks', createdAt: '2026-01-01T00:00:00Z' },
      ],
    });
  });

  it('reports an inactive application instead of throwing', async () => {
    mockFetchResponse(403, INACTIVE_APPLICATION_BODY);

    const status = await getWebhookSubscriptions();

    expect(status.subscriptions).toEqual([]);
    expect(status.error).toBe(
      'The Strava application is inactive. Reactivate it in your Strava API settings to manage webhooks.',
    );
  });

  it('reports other Strava refusals instead of throwing', async () => {
    mockFetchResponse(500, 'upstream exploded');

    const status = await getWebhookSubscriptions();

    expect(status.subscriptions).toEqual([]);
    expect(status.error).toBe('Strava returned 500: upstream exploded');
  });

  it('still throws when something other than Strava fails', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('socket hang up'));

    await expect(getWebhookSubscriptions()).rejects.toThrow('socket hang up');
  });

  it('still throws when the Strava client credentials are missing', async () => {
    mockEnv({ STRAVA_CLIENT_ID: undefined, STRAVA_CLIENT_SECRET: undefined });

    await expect(getWebhookSubscriptions()).rejects.toThrow('Missing client_id or client_secret');
  });
});
