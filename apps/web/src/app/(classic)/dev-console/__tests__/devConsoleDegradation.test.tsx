/**
 * The console's cards each talk to a third party, and any of those can be
 * unavailable. Resolving the cards here proves an unavailable one renders a
 * state instead of throwing, which is what took the whole route down.
 */
import { log } from '@dg/shared-core/logging/log';
import { mockEnv, setupMockLifecycle } from '@dg/testing/mocks';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

jest.mock('next/server', () => ({
  connection: jest.fn().mockResolvedValue(undefined),
}));

// Client buttons reach for the router, which only exists under a real request.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

jest.mock('@dg/services/oauth/getOauthStatus', () => ({
  getOauthStatus: jest.fn(),
}));

// Server actions pull in next/cache, which needs a request runtime jsdom lacks.
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

import { getOauthStatus } from '@dg/services/oauth/getOauthStatus';
import { OauthCardContent } from '../oauth/OauthCard';
import { WebhookCardContent } from '../webhooks/WebhookCard';

const mockGetOauthStatus = jest.mocked(getOauthStatus);

/** Subscription details render relative timestamps, which need server time. */
const renderCard = (card: ReactNode) =>
  render(
    <ServerTimeProvider serverTime={Date.parse('2026-02-01T00:00:00Z')}>{card}</ServerTimeProvider>,
  );

/** What Strava answers once an application is switched off. */
const INACTIVE_APPLICATION_BODY = JSON.stringify({
  errors: [{ code: 'Inactive', field: 'Status', resource: 'Application' }],
  message: 'Forbidden',
});

/** jsdom has no fetch at all, so stand in for the parts Strava calls use. */
const mockStravaResponse = (status: number, body: string) => {
  const response = {
    json: () => Promise.resolve(JSON.parse(body) as unknown),
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body),
  };
  globalThis.fetch = jest.fn().mockResolvedValue(response) as unknown as typeof fetch;
};

describe('Dev console degradation', () => {
  setupMockLifecycle();

  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockEnv({ STRAVA_CLIENT_ID: 'client-id', STRAVA_CLIENT_SECRET: 'client-secret' });
    jest.spyOn(log, 'error').mockImplementation(() => undefined);
    jest.spyOn(log, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Strava webhook card', () => {
    it('explains an inactive application instead of throwing', async () => {
      mockStravaResponse(403, INACTIVE_APPLICATION_BODY);

      renderCard(await WebhookCardContent());

      expect(screen.getByText(/The Strava application is inactive\./)).toBeInTheDocument();
    });

    it('offers no subscription actions while the state is unknown', async () => {
      mockStravaResponse(403, INACTIVE_APPLICATION_BODY);

      renderCard(await WebhookCardContent());

      expect(screen.queryByRole('button', { name: 'Create subscription' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Delete subscription' })).not.toBeInTheDocument();
    });

    it('offers to create a subscription when Strava reports none', async () => {
      mockStravaResponse(200, '[]');

      renderCard(await WebhookCardContent());

      expect(screen.getByRole('button', { name: 'Create subscription' })).toBeInTheDocument();
      expect(screen.getByText('Not connected')).toBeInTheDocument();
    });

    it('lists an existing subscription', async () => {
      mockStravaResponse(
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

      renderCard(await WebhookCardContent());

      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Delete subscription' })).toBeInTheDocument();
    });
  });

  describe('OAuth card', () => {
    it('renders a disconnected card when the token is missing', async () => {
      mockGetOauthStatus.mockResolvedValue({ error: null, expiresAt: null, isConnected: false });

      renderCard(await OauthCardContent({ provider: 'spotify' }));

      expect(screen.getByText('Spotify')).toBeInTheDocument();
      expect(screen.getByText('Not connected')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Connect' })).toBeInTheDocument();
    });

    it('surfaces a lookup failure on the card', async () => {
      mockGetOauthStatus.mockResolvedValue({
        error: 'Failed to fetch OAuth status',
        expiresAt: null,
        isConnected: false,
      });

      renderCard(await OauthCardContent({ provider: 'strava' }));

      expect(screen.getByText('Failed to fetch OAuth status')).toBeInTheDocument();
    });
  });
});
