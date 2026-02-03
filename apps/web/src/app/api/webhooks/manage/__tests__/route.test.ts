/**
 * @jest-environment node
 */
import { log } from '@dg/shared-core/helpers/log';
import { NextRequest } from 'next/server';

// Mock all the service functions before importing the route
jest.mock('../../../../../services/strava', () => ({
  createWebhookSubscription: jest.fn(),
  deleteWebhookSubscription: jest.fn(),
  listWebhookSubscriptions: jest.fn(),
}));

import * as stravaService from '../../../../../services/strava';
import { DELETE, GET, POST } from '../route';

const mockListSubscriptions = jest.mocked(stravaService.listWebhookSubscriptions);
const mockCreateSubscription = jest.mocked(stravaService.createWebhookSubscription);
const mockDeleteSubscription = jest.mocked(stravaService.deleteWebhookSubscription);

const setNodeEnv = (env: string) => {
  Object.defineProperty(process.env, 'NODE_ENV', { value: env, writable: true });
};

describe('Webhook Manage Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(log, 'info').mockImplementation(() => undefined);
    jest.spyOn(log, 'error').mockImplementation(() => undefined);
    // Ensure we're in development mode for most tests
    setNodeEnv('development');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    setNodeEnv('test');
  });

  describe('environment gating', () => {
    it('returns 404 in production for GET', async () => {
      setNodeEnv('production');

      const response = await GET();

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.error).toBe('Not Found');
      expect(mockListSubscriptions).not.toHaveBeenCalled();
    });

    it('returns 404 in production for POST', async () => {
      setNodeEnv('production');

      const response = await POST();

      expect(response.status).toBe(404);
      expect(mockCreateSubscription).not.toHaveBeenCalled();
    });

    it('returns 404 in production for DELETE', async () => {
      setNodeEnv('production');

      const request = new NextRequest('https://example.com/api/webhooks/manage?id=123', {
        method: 'DELETE',
      });

      const response = await DELETE(request);

      expect(response.status).toBe(404);
      expect(mockDeleteSubscription).not.toHaveBeenCalled();
    });

    it('allows requests in test environment', async () => {
      setNodeEnv('test');
      mockListSubscriptions.mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
    });
  });

  describe('GET handler', () => {
    it('returns list of subscriptions', async () => {
      const mockSubscriptions = [
        {
          application_id: 456,
          callback_url: 'https://example.com/api/webhooks',
          created_at: '2024-01-01T00:00:00Z',
          id: 123,
          resource_state: 2,
        },
      ];
      mockListSubscriptions.mockResolvedValue(mockSubscriptions);

      const response = await GET();

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.subscriptions).toEqual(mockSubscriptions);
      expect(mockListSubscriptions).toHaveBeenCalledWith('strava');
    });

    it('returns empty array when no subscriptions', async () => {
      mockListSubscriptions.mockResolvedValue([]);

      const response = await GET();

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.subscriptions).toEqual([]);
    });

    it('returns 500 on error', async () => {
      mockListSubscriptions.mockRejectedValue(new Error('API error'));

      const response = await GET();

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Failed to list subscriptions');
      expect(log.error).toHaveBeenCalled();
    });
  });

  describe('POST handler', () => {
    it('creates subscription and returns 201', async () => {
      const mockSubscription = {
        application_id: 456,
        callback_url: 'https://example.com/api/webhooks',
        created_at: '2024-01-01T00:00:00Z',
        id: 123,
        resource_state: 2,
      };
      mockCreateSubscription.mockResolvedValue(mockSubscription);

      const response = await POST();

      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.subscription).toEqual(mockSubscription);
      expect(mockCreateSubscription).toHaveBeenCalledWith('strava');
    });

    it('returns 500 with error message on failure', async () => {
      mockCreateSubscription.mockRejectedValue(new Error('Subscription already exists'));

      const response = await POST();

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Subscription already exists');
      expect(log.error).toHaveBeenCalled();
    });
  });

  describe('DELETE handler', () => {
    const createDeleteRequest = (id?: string): NextRequest => {
      const url = new URL('https://example.com/api/webhooks/manage');
      if (id) {
        url.searchParams.set('id', id);
      }
      return new NextRequest(url, { method: 'DELETE' });
    };

    it('deletes subscription and returns success', async () => {
      mockDeleteSubscription.mockResolvedValue(true);

      const response = await DELETE(createDeleteRequest('123'));

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(mockDeleteSubscription).toHaveBeenCalledWith('strava', 123);
    });

    it('returns 400 when id is missing', async () => {
      const response = await DELETE(createDeleteRequest());

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Missing subscription id');
      expect(mockDeleteSubscription).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid id', async () => {
      const response = await DELETE(createDeleteRequest('not-a-number'));

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Invalid subscription id');
      expect(mockDeleteSubscription).not.toHaveBeenCalled();
    });

    it('returns 500 on deletion error', async () => {
      mockDeleteSubscription.mockRejectedValue(new Error('Subscription not found'));

      const response = await DELETE(createDeleteRequest('999'));

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Subscription not found');
      expect(log.error).toHaveBeenCalled();
    });
  });
});
