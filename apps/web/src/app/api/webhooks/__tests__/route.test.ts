/**
 * @jest-environment node
 */
import { log } from '@dg/shared-core/helpers/log';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock all the service functions before importing the route
jest.mock('../../../../services/strava', () => ({
  echoStravaChallengeIfValid: jest.fn(),
  syncStravaWebhookUpdateWithDb: jest.fn(),
}));

// Mock revalidateTag
jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import { revalidateTag } from 'next/cache';
// Get typed references to the mocked functions
import * as stravaService from '../../../../services/strava';

const mockSyncWebhook = jest.mocked(stravaService.syncStravaWebhookUpdateWithDb);
const mockEchoChallenge = jest.mocked(stravaService.echoStravaChallengeIfValid);
const mockRevalidateTag = jest.mocked(revalidateTag);

describe('Webhook Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(log, 'info').mockImplementation(() => undefined);
    jest.spyOn(log, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST handler', () => {
    const createRequest = (body: unknown): NextRequest => {
      const request = new NextRequest('https://example.com/api/webhooks', {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      return request;
    };

    describe('valid activity webhook events', () => {
      it('processes create event and returns 200', async () => {
        mockSyncWebhook.mockResolvedValue(undefined);

        const body = {
          aspect_type: 'create',
          event_time: 1769970717,
          object_id: 17234236452,
          object_type: 'activity',
          owner_id: 17469310,
          subscription_id: 254710,
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(200);
        expect(mockSyncWebhook).toHaveBeenCalledWith(body);
        expect(mockRevalidateTag).toHaveBeenCalledWith('latest-activity', 'max');
      });

      it('processes update event and returns 200', async () => {
        mockSyncWebhook.mockResolvedValue(undefined);

        const body = {
          aspect_type: 'update',
          event_time: 1769970717,
          object_id: 17234236452,
          object_type: 'activity',
          owner_id: 17469310,
          subscription_id: 254710,
          updates: { title: 'Heated rivalry with the boysss 🔥' },
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(200);
        expect(mockSyncWebhook).toHaveBeenCalledWith(body);
      });

      it('processes delete event and returns 200', async () => {
        mockSyncWebhook.mockResolvedValue(undefined);

        const body = {
          aspect_type: 'delete',
          object_id: 17234236452,
          object_type: 'activity',
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(200);
        expect(mockSyncWebhook).toHaveBeenCalledWith(body);
      });
    });

    describe('athlete webhook events', () => {
      it('ignores athlete events and returns 200', async () => {
        const body = {
          aspect_type: 'update',
          object_id: 17469310,
          object_type: 'athlete',
          updates: { authorized: 'false' },
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(200);
        expect(mockSyncWebhook).not.toHaveBeenCalled();
      });
    });

    describe('error handling', () => {
      it('returns 400 for invalid JSON body', async () => {
        const request = new NextRequest('https://example.com/api/webhooks', {
          body: 'not json',
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        const response = await POST(request);

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toBe('Bad Request');
      });

      it('returns 400 for invalid webhook payload', async () => {
        const body = {
          invalid: 'payload',
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(400);
        const json = await response.json();
        expect(json.error).toBe('Bad Request');
      });

      it('returns 400 for missing required fields', async () => {
        const body = {
          aspect_type: 'create',
          // missing object_id and object_type
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(400);
      });

      it('returns 500 when sync fails', async () => {
        mockSyncWebhook.mockRejectedValue(new Error('Sync failed'));

        const body = {
          aspect_type: 'update',
          object_id: 17234236452,
          object_type: 'activity',
          updates: { title: 'Test' },
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(500);
        const json = await response.json();
        expect(json.error).toBe('Failed to sync Strava webhook');
        expect(log.error).toHaveBeenCalledWith(
          'Failed to sync Strava webhook event',
          expect.objectContaining({ error: expect.any(Error) }),
        );
      });

      it('returns 500 when activity data is missing', async () => {
        mockSyncWebhook.mockRejectedValue(new Error('Missing activity data for 17234236452'));

        const body = {
          aspect_type: 'update',
          object_id: 17234236452,
          object_type: 'activity',
        };

        const response = await POST(createRequest(body));

        expect(response.status).toBe(500);
      });
    });

    describe('validation edge cases', () => {
      it('accepts valid aspect_type values', async () => {
        mockSyncWebhook.mockResolvedValue(undefined);

        for (const aspectType of ['create', 'update', 'delete']) {
          const body = {
            aspect_type: aspectType,
            object_id: 12345,
            object_type: 'activity',
          };

          const response = await POST(createRequest(body));
          expect(response.status).toBe(200);
        }
      });

      it('rejects invalid aspect_type values', async () => {
        const body = {
          aspect_type: 'invalid',
          object_id: 12345,
          object_type: 'activity',
        };

        const response = await POST(createRequest(body));
        expect(response.status).toBe(400);
      });

      it('rejects invalid object_type values', async () => {
        const body = {
          aspect_type: 'create',
          object_id: 12345,
          object_type: 'unknown',
        };

        const response = await POST(createRequest(body));
        expect(response.status).toBe(400);
      });
    });
  });

  describe('GET handler', () => {
    const createGetRequest = (params: Record<string, string>): NextRequest => {
      const url = new URL('https://example.com/api/webhooks');
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      return new NextRequest(url, { method: 'GET' });
    };

    describe('challenge verification', () => {
      it('returns challenge response for valid verification request', async () => {
        mockEchoChallenge.mockReturnValue({ 'hub.challenge': 'abc123' });

        const request = createGetRequest({
          'hub.challenge': 'abc123',
          'hub.mode': 'subscribe',
          'hub.verify_token': 'valid_token',
        });

        const response = await GET(request);

        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json).toEqual({ 'hub.challenge': 'abc123' });
      });

      it('returns 400 for invalid challenge', async () => {
        mockEchoChallenge.mockImplementation(() => {
          throw new Error('Invalid challenge');
        });

        const request = createGetRequest({
          'hub.challenge': 'abc123',
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong_token',
        });

        const response = await GET(request);

        expect(response.status).toBe(400);
      });
    });

    describe('invalid requests', () => {
      it('returns 400 for requests without valid params', async () => {
        mockEchoChallenge.mockReturnValue(null);

        const request = createGetRequest({});

        const response = await GET(request);

        expect(response.status).toBe(400);
      });
    });
  });
});
