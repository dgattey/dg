import type { StravaWebhookEvent } from '@dg/content-models/strava/StravaWebhookEvent';
import { db } from '@dg/db';
import { log } from '@dg/shared-core/helpers/log';
import * as stravaClientModule from '../stravaClient';
import { syncStravaWebhookUpdateWithDb } from '../syncStravaWebhookUpdateWithDb';

// Mock external boundaries only
jest.mock('@dg/db', () => ({
  db: {
    StravaActivity: {
      destroy: jest.fn(),
      findOne: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock('../stravaClient', () => ({
  stravaClient: {
    get: jest.fn(),
  },
}));

describe('syncStravaWebhookUpdateWithDb', () => {
  const mockFindOne = db.StravaActivity.findOne as jest.Mock;
  const mockUpsert = db.StravaActivity.upsert as jest.Mock;
  const mockDestroy = db.StravaActivity.destroy as jest.Mock;
  const mockStravaGet = stravaClientModule.stravaClient.get as jest.Mock;

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

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(log, 'info').mockImplementation(() => undefined);
    jest.spyOn(log, 'error').mockImplementation(() => undefined);

    mockFindOne.mockResolvedValue(null);
    mockUpsert.mockResolvedValue([{ id: 17234236452 }, true]);
    mockStravaGet.mockResolvedValue({
      response: { json: async () => stravaApiResponse },
      status: 200,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
      expect(mockUpsert).toHaveBeenCalledTimes(1);

      const savedData = mockUpsert.mock.calls[0][0];
      // Verify snake_case was converted to camelCase
      expect(savedData.activityData.startDate).toBe('2026-01-31T02:36:33Z');
      expect(savedData.activityData.sportType).toBe('Ride');
      expect(savedData.activityData.movingTime).toBe(1610);
      expect(savedData.activityData.gear.resourceState).toBe(2);
      expect(savedData.activityData.map.summaryPolyline).toBe('xyz');
      expect(savedData.activityData.url).toBe('https://www.strava.com/activities/17234236452');
      // Verify no snake_case keys leaked through
      expect(savedData.activityData).not.toHaveProperty('start_date');
      expect(savedData.activityData).not.toHaveProperty('sport_type');
      // Verify Date conversion
      expect(savedData.activityStartDate).toEqual(new Date('2026-01-31T02:36:33Z'));
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

      expect(mockFindOne).toHaveBeenCalledWith({
        attributes: ['lastUpdate'],
        where: { id: 17234236452 },
      });
      expect(mockStravaGet).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('fetches and updates when last update is old', async () => {
      mockFindOne.mockResolvedValue({ lastUpdate: new Date(Date.now() - 120000) });

      await syncStravaWebhookUpdateWithDb(updateEvent);

      expect(mockStravaGet).toHaveBeenCalled();
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('skips when last update is too recent (within 1 minute)', async () => {
      mockFindOne.mockResolvedValue({ lastUpdate: new Date(Date.now() - 30000) });

      await syncStravaWebhookUpdateWithDb(updateEvent);

      expect(mockStravaGet).not.toHaveBeenCalled();
      expect(mockUpsert).not.toHaveBeenCalled();
    });
  });

  describe('delete events', () => {
    const deleteEvent: StravaWebhookEvent = {
      aspect_type: 'delete',
      object_id: 17234236452,
      object_type: 'activity',
    };

    it('deletes from DB without calling API', async () => {
      mockDestroy.mockResolvedValue(1);

      await syncStravaWebhookUpdateWithDb(deleteEvent);

      expect(mockDestroy).toHaveBeenCalledWith({ where: { id: 17234236452 } });
      expect(mockStravaGet).not.toHaveBeenCalled();
    });

    it('succeeds even when activity does not exist', async () => {
      mockDestroy.mockResolvedValue(0);

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

      const savedData = mockUpsert.mock.calls[0][0];
      expect(savedData.activityData.startDate).toBe('2026-01-31T02:36:33Z');
      expect(savedData.activityData.name).toBe('Heated rivalry with the boysss 🔥');
      expect(savedData.activityData).not.toHaveProperty('start_date');
    });
  });
});
