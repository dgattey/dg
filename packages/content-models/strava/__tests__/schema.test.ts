import { safeParse } from 'valibot';
import { stravaActivityApiSchema } from '../StravaActivity';
import { stravaWebhookEventSchema, validateStravaWebhookEvent } from '../StravaWebhookEvent';

describe('stravaActivityApiSchema', () => {
  it('parses activity payloads', () => {
    const input = {
      distance: 1000,
      id: 123,
      start_date: '2024-01-01T00:00:00Z',
      type: 'Ride',
    };

    expect(safeParse(stravaActivityApiSchema, input).success).toBe(true);
  });
});

describe('stravaWebhookEventSchema', () => {
  describe('activity events', () => {
    it('parses activity update with all fields', () => {
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

    it('parses activity update with only title (partial update)', () => {
      const input = {
        aspect_type: 'update',
        event_time: 1769967863,
        object_id: 17234236452,
        object_type: 'activity',
        owner_id: 17469310,
        subscription_id: 254710,
        updates: { title: 'Heated rivalry with the boysss 🔥' },
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
    });

    it('parses activity update with only privacy change', () => {
      const input = {
        aspect_type: 'update',
        object_id: 123,
        object_type: 'activity',
        updates: { private: 'true' },
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
    });

    it('parses activity update with only type change', () => {
      const input = {
        aspect_type: 'update',
        object_id: 123,
        object_type: 'activity',
        updates: { type: 'Run' },
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
    });

    it('parses activity create event without updates', () => {
      const input = {
        aspect_type: 'create',
        event_time: 1769967863,
        object_id: 123,
        object_type: 'activity',
        owner_id: 17469310,
        subscription_id: 254710,
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
    });

    it('parses activity delete event without updates', () => {
      const input = {
        aspect_type: 'delete',
        event_time: 1769967863,
        object_id: 123,
        object_type: 'activity',
        owner_id: 17469310,
        subscription_id: 254710,
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
    });

    it('parses activity update with empty updates object', () => {
      const input = {
        aspect_type: 'update',
        object_id: 123,
        object_type: 'activity',
        updates: {},
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
    });
  });

  describe('athlete events', () => {
    it('parses athlete deauthorization event', () => {
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

    it('parses athlete event without updates', () => {
      const input = {
        aspect_type: 'update',
        object_id: 456,
        object_type: 'athlete',
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(true);
    });
  });

  describe('invalid events', () => {
    it('rejects event without object_id', () => {
      const input = {
        aspect_type: 'update',
        object_type: 'activity',
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(false);
    });

    it('rejects event without aspect_type', () => {
      const input = {
        object_id: 123,
        object_type: 'activity',
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(false);
    });

    it('rejects event without object_type', () => {
      const input = {
        aspect_type: 'update',
        object_id: 123,
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(false);
    });

    it('rejects event with invalid aspect_type', () => {
      const input = {
        aspect_type: 'invalid',
        object_id: 123,
        object_type: 'activity',
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(false);
    });

    it('rejects event with invalid object_type', () => {
      const input = {
        aspect_type: 'update',
        object_id: 123,
        object_type: 'workout',
      };

      expect(safeParse(stravaWebhookEventSchema, input).success).toBe(false);
    });

    it('rejects null input', () => {
      expect(safeParse(stravaWebhookEventSchema, null).success).toBe(false);
    });

    it('rejects undefined input', () => {
      expect(safeParse(stravaWebhookEventSchema, undefined).success).toBe(false);
    });

    it('rejects non-object input', () => {
      expect(safeParse(stravaWebhookEventSchema, 'string').success).toBe(false);
    });
  });
});

describe('validateStravaWebhookEvent', () => {
  it('returns success result for valid event', () => {
    const input = {
      aspect_type: 'update',
      object_id: 123,
      object_type: 'activity',
      updates: { title: 'Test' },
    };

    const result = validateStravaWebhookEvent(input);
    expect(result.success).toBe(true);
  });

  it('returns failure result with issues for invalid event', () => {
    const input = { invalid: 'data' };

    const result = validateStravaWebhookEvent(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues.length).toBeGreaterThan(0);
    }
  });
});
