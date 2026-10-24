import { parse, safeParse } from 'valibot';
import {
  mapStravaActivityFromApi,
  STRAVA_ACTIVITY_FIELD_KINDS,
  stravaActivityApiSchema,
  stravaActivitySchema,
  toCamelCaseKey,
} from '../StravaActivity';
import { stravaWebhookEventSchema, validateStravaWebhookEvent } from '../StravaWebhookEvent';

describe('stravaActivityApiSchema', () => {
  it('parses activity payloads and maps snake_case fields to camelCase domain shape', () => {
    const input = {
      achievement_count: 1,
      average_speed: 5.944,
      calories: 346,
      commute: true,
      description: 'Great ride!',
      distance: 1000,
      elapsed_time: 16356,
      end_latlng: [37.717798, -122.450229] as [number, number],
      gear: {
        distance: 7828686,
        id: 'b12917761',
        name: 'Cruz',
        primary: false,
        resource_state: 2,
      },
      gear_id: 'b12917761',
      id: 123,
      map: {
        id: 'a123',
        polyline: 'abc123',
        summary_polyline: 'abc',
      },
      moving_time: 1610,
      sport_type: 'Ride',
      start_date: '2024-01-01T00:00:00Z',
      start_latlng: [37.77296, -122.410974] as [number, number],
      total_elevation_gain: 134.5,
      type: 'Ride',
    };

    const parsed = parse(stravaActivityApiSchema, input);
    const mapped = mapStravaActivityFromApi(parsed);

    expect(mapped).toMatchObject({
      achievementCount: 1,
      averageSpeed: 5.944,
      calories: 346,
      commute: true,
      description: 'Great ride!',
      distance: 1000,
      elapsedTime: 16356,
      endLatlng: [37.717798, -122.450229],
      gear: {
        distance: 7828686,
        id: 'b12917761',
        name: 'Cruz',
        primary: false,
        resourceState: 2,
      },
      gearId: 'b12917761',
      id: 123,
      map: {
        id: 'a123',
        polyline: 'abc123',
        summaryPolyline: 'abc',
      },
      movingTime: 1610,
      name: 'Strava Activity',
      sportType: 'Ride',
      startDate: '2024-01-01T00:00:00Z',
      startLatlng: [37.77296, -122.410974],
      totalElevationGain: 134.5,
      type: 'Ride',
      url: 'https://www.strava.com/activities/123',
    });
  });

  it('reads an empty coordinate pair from a GPS-less activity as null', () => {
    const parsed = safeParse(stravaActivityApiSchema, {
      end_latlng: [],
      id: 123,
      start_latlng: [37.77, -122.41],
      type: 'VirtualRide',
    });

    expect(parsed.success && parsed.output.end_latlng).toBeNull();
    expect(parsed.success && parsed.output.start_latlng).toEqual([37.77, -122.41]);
  });

  it('round-trips every field in STRAVA_ACTIVITY_FIELD_KINDS through mapStravaActivityFromApi and stravaActivitySchema', () => {
    const sampleByKind = {
      boolean: true,
      latlng: [37.77, -122.41],
      number: 42,
      'number-required': 999,
      string: '2026-10-24T00:00:00Z',
      'string-required': 'Ride',
    } as const;
    const rawPayload = Object.fromEntries(
      Object.entries(STRAVA_ACTIVITY_FIELD_KINDS).map(([key, kind]) => [key, sampleByKind[kind]]),
    );

    const apiParsed = parse(stravaActivityApiSchema, rawPayload);
    const mapped = mapStravaActivityFromApi(apiParsed);
    const storedParsed = parse(stravaActivitySchema, mapped);

    for (const [snakeKey, kind] of Object.entries(STRAVA_ACTIVITY_FIELD_KINDS)) {
      const camelKey = toCamelCaseKey(snakeKey);
      expect(storedParsed[camelKey as keyof typeof storedParsed]).toEqual(sampleByKind[kind]);
    }
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
