import { safeParse } from 'valibot';
import { stravaActivityApiSchema } from '../StravaActivity';
import { stravaWebhookEventSchema } from '../StravaWebhookEvent';

describe('strava schemas', () => {
  it('parses activity payloads', () => {
    const input = {
      distance: 1000,
      id: 123,
      start_date: '2024-01-01T00:00:00Z',
      type: 'Ride',
    };

    expect(safeParse(stravaActivityApiSchema, input).success).toBe(true);
  });

  it('parses activity webhook events', () => {
    const input = {
      aspect_type: 'update',
      object_id: 123,
      object_type: 'activity',
      updates: {
        private: 'false',
        title: 'Morning Ride',
        type: 'Ride',
      },
    };

    expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
  });

  it('parses athlete webhook events', () => {
    const input = {
      aspect_type: 'delete',
      object_id: 456,
      object_type: 'athlete',
      updates: {
        authorized: 'false',
      },
    };

    expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
  });
});
