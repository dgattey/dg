import type { StravaWebhookEvent } from '@dg/content-models/strava/StravaWebhookEvent';
import { setupTestDatabase } from '@dg/testing/databaseSetup';
import { setupMockLifecycle } from '@dg/testing/mocks';

const mockStravaGet = jest.fn<
  Promise<{ response: { json: () => Promise<unknown> }; status: number }>,
  [string]
>();

jest.mock('../stravaClient', () => ({
  stravaClient: {
    get: mockStravaGet,
  },
}));

describe('syncStravaWebhookUpdateWithDb', () => {
  const db = setupTestDatabase({ truncate: ['StravaActivity'] });
  setupMockLifecycle();

  let syncStravaWebhookUpdateWithDb: typeof import('../syncStravaWebhookUpdateWithDb').syncStravaWebhookUpdateWithDb;

  // Real Strava API response format (snake_case) - this flows through real mapping code
  const stravaApiResponse = {
    achievement_count: 1,
    average_speed: 5.944,
    calories: 346,
    distance: 9569.5,
    gear: { distance: 7828686, id: 'b12917761', name: 'Cruz', primary: false, resource_state: 2 },
    gear_id: 'b12917761',
    id: 17234236452,
    map: { id: 'a17234236452', polyline: 'abc', summary_polyline: 'xyz' },
    moving_time: 1610,
    name: 'Morning Ride',
    photos: { count: 0, primary: null },
    sport_type: 'Ride',
    start_date: '2026-01-31T02:36:33Z',
    type: 'Ride',
  };

  const existingActivityData = {
    id: 17234236452,
    name: 'Existing Activity',
    type: 'Ride',
    url: 'https://www.strava.com/activities/17234236452',
  };

  beforeAll(async () => {
    ({ syncStravaWebhookUpdateWithDb } = await import('../syncStravaWebhookUpdateWithDb'));
  });

  beforeEach(() => {
    mockStravaGet.mockResolvedValue({
      response: { json: async () => stravaApiResponse },
      status: 200,
    });
  });

  describe('create events', () => {
    const createEvent: StravaWebhookEvent = {
      aspect_type: 'create',
      object_id: 17234236452,
      object_type: 'activity',
    };

    it('fetches from API, maps snake_case to camelCase, and saves to DB', async () => {
      await syncStravaWebhookUpdateWithDb(createEvent);

      expect(mockStravaGet).toHaveBeenCalledWith('activities/17234236452');

      const savedActivity = await db.StravaActivity.findOne({
        where: { id: 17234236452 },
      });
      expect(savedActivity).not.toBeNull();
      const savedData = savedActivity?.activityData;
      expect(savedData).not.toBeNull();
      // Verify snake_case was converted to camelCase
      expect(savedData?.startDate).toBe('2026-01-31T02:36:33Z');
      expect(savedData?.sportType).toBe('Ride');
      expect(savedData?.movingTime).toBe(1610);
      expect(savedData?.gear?.resourceState).toBe(2);
      expect(savedData?.map?.summaryPolyline).toBe('xyz');
      expect(savedData?.url).toBe('https://www.strava.com/activities/17234236452');
      // Verify no snake_case keys leaked through
      expect(savedData).not.toHaveProperty('start_date');
      expect(savedData).not.toHaveProperty('sport_type');
      // Verify Date conversion
      expect(savedActivity?.activityStartDate).toEqual(new Date('2026-01-31T02:36:33Z'));
    });

    it('throws when API returns 404', async () => {
      mockStravaGet.mockResolvedValue({ response: { json: async () => ({}) }, status: 404 });

      await expect(syncStravaWebhookUpdateWithDb(createEvent)).rejects.toThrow(
        'Missing activity data for 17234236452',
      );
    });

    it('throws when API response missing start_date', async () => {
      mockStravaGet.mockResolvedValue({
        response: { json: async () => ({ id: 17234236452, type: 'Ride' }) },
        status: 200,
      });

      await expect(syncStravaWebhookUpdateWithDb(createEvent)).rejects.toThrow(
        'Missing activity data for 17234236452',
      );
    });
  });

  describe('update events', () => {
    const updateEvent: StravaWebhookEvent = {
      aspect_type: 'update',
      object_id: 17234236452,
      object_type: 'activity',
      updates: { title: 'New Title' },
    };

    it('fetches and updates when no recent update exists', async () => {
      await syncStravaWebhookUpdateWithDb(updateEvent);

      expect(mockStravaGet).toHaveBeenCalled();
      const savedActivity = await db.StravaActivity.findOne({
        where: { id: 17234236452 },
      });
      expect(savedActivity).not.toBeNull();
    });

    it('fetches and updates when last update is old', async () => {
      await db.StravaActivity.create({
        activityData: existingActivityData,
        activityStartDate: new Date('2026-01-31T02:36:33Z'),
        id: 17234236452,
        lastUpdate: new Date(Date.now() - 120000),
      });

      await syncStravaWebhookUpdateWithDb(updateEvent);

      expect(mockStravaGet).toHaveBeenCalled();
      const savedActivity = await db.StravaActivity.findOne({
        where: { id: 17234236452 },
      });
      expect(savedActivity?.activityData?.name).toBe('Morning Ride');
    });

    it('skips when last update is too recent (within 1 minute)', async () => {
      await db.StravaActivity.create({
        activityData: existingActivityData,
        activityStartDate: new Date('2026-01-31T02:36:33Z'),
        id: 17234236452,
        lastUpdate: new Date(Date.now() - 30000),
      });

      await syncStravaWebhookUpdateWithDb(updateEvent);

      expect(mockStravaGet).not.toHaveBeenCalled();
      const savedActivity = await db.StravaActivity.findOne({
        where: { id: 17234236452 },
      });
      expect(savedActivity?.activityData?.name).toBe('Existing Activity');
    });
  });

  describe('delete events', () => {
    const deleteEvent: StravaWebhookEvent = {
      aspect_type: 'delete',
      object_id: 17234236452,
      object_type: 'activity',
    };

    it('deletes from DB without calling API', async () => {
      await db.StravaActivity.create({
        activityData: existingActivityData,
        activityStartDate: new Date('2026-01-31T02:36:33Z'),
        id: 17234236452,
        lastUpdate: new Date(),
      });

      await syncStravaWebhookUpdateWithDb(deleteEvent);

      expect(mockStravaGet).not.toHaveBeenCalled();
      const savedActivity = await db.StravaActivity.findOne({
        where: { id: 17234236452 },
      });
      expect(savedActivity).toBeNull();
    });

    it('succeeds even when activity does not exist', async () => {
      await expect(syncStravaWebhookUpdateWithDb(deleteEvent)).resolves.not.toThrow();
    });
  });

  describe('regression: real webhook payload', () => {
    it('handles full API response from logs correctly', async () => {
      const fullApiResponse = {
        achievement_count: 1,
        athlete: { id: 17469310, resource_state: 1 },
        average_speed: 5.944,
        calories: 346,
        comment_count: 0,
        commute: true,
        description: 'Such a cute episode 🥹',
        device_name: 'Strava App',
        distance: 9569.5,
        elapsed_time: 16356,
        elev_high: 106.2,
        elev_low: 5.8,
        end_latlng: [37.717798, -122.450229],
        gear: {
          distance: 7828686,
          id: 'b12917761',
          name: 'Cruz',
          primary: false,
          resource_state: 2,
        },
        gear_id: 'b12917761',
        id: 17234236452,
        kudos_count: 7,
        location_city: null,
        map: { id: 'a17234236452', polyline: '}opeFrkcjV...', summary_polyline: 'gdpeF`rcjV...' },
        max_speed: 11.66,
        moving_time: 1610,
        name: 'Heated rivalry with the boysss 🔥',
        perceived_exertion: 6,
        photo_count: 0,
        photos: { count: 0, primary: null },
        pr_count: 0,
        resource_state: 3,
        sport_type: 'Ride',
        start_date: '2026-01-31T02:36:33Z',
        start_date_local: '2026-01-30T18:36:33Z',
        start_latlng: [37.77296, -122.410974],
        timezone: '(GMT-08:00) America/Los_Angeles',
        total_elevation_gain: 134.5,
        type: 'Ride',
        utc_offset: -28800,
        workout_type: 10,
      };

      mockStravaGet.mockResolvedValue({
        response: { json: async () => fullApiResponse },
        status: 200,
      });

      const updateEvent: StravaWebhookEvent = {
        aspect_type: 'update',
        object_id: 17234236452,
        object_type: 'activity',
        updates: { title: 'Heated rivalry with the boysss 🔥' },
      };

      await syncStravaWebhookUpdateWithDb(updateEvent);

      const savedActivity = await db.StravaActivity.findOne({
        where: { id: 17234236452 },
      });
      expect(savedActivity?.activityData?.startDate).toBe('2026-01-31T02:36:33Z');
      expect(savedActivity?.activityData?.name).toBe('Heated rivalry with the boysss 🔥');
      expect(savedActivity?.activityData).not.toHaveProperty('start_date');
    });
  });
});
