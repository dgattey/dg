import { mapActivityFromApi } from '../paredStravaActivity';

describe('mapActivityFromApi', () => {
  describe('with null/undefined input', () => {
    it('returns null for null input', () => {
      expect(mapActivityFromApi(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(mapActivityFromApi(undefined)).toBeNull();
    });
  });

  describe('converts API format (snake_case) to domain format (camelCase)', () => {
    const apiActivity = {
      achievement_count: 1,
      average_speed: 5.944,
      calories: 346,
      comment_count: 0,
      commute: true,
      description: 'Great ride!',
      distance: 9569.5,
      elapsed_time: 16356,
      elev_high: 106.2,
      elev_low: 5.8,
      end_latlng: [37.717798, -122.450229] as [number, number],
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
      location_country: null,
      location_state: null,
      map: {
        id: 'a17234236452',
        polyline: 'abc123',
        summary_polyline: 'abc',
      },
      max_speed: 11.66,
      moving_time: 1610,
      name: 'Morning Ride',
      perceived_exertion: 6,
      photo_count: 0,
      photos: { count: 0, primary: null },
      pr_count: 0,
      sport_type: 'Ride',
      start_date: '2026-01-31T02:36:33Z',
      start_latlng: [37.77296, -122.410974] as [number, number],
      total_elevation_gain: 134.5,
      type: 'Ride',
    };

    it('converts snake_case fields to camelCase', () => {
      const result = mapActivityFromApi(apiActivity);

      expect(result).not.toBeNull();
      expect(result?.startDate).toBe('2026-01-31T02:36:33Z');
      expect(result?.sportType).toBe('Ride');
      expect(result?.movingTime).toBe(1610);
      expect(result?.elapsedTime).toBe(16356);
      expect(result?.totalElevationGain).toBe(134.5);
      expect(result?.averageSpeed).toBe(5.944);
      expect(result?.maxSpeed).toBe(11.66);
      expect(result?.startLatlng).toEqual([37.77296, -122.410974]);
      expect(result?.endLatlng).toEqual([37.717798, -122.450229]);
      expect(result?.kudosCount).toBe(7);
      expect(result?.commentCount).toBe(0);
      expect(result?.achievementCount).toBe(1);
      expect(result?.prCount).toBe(0);
      expect(result?.photoCount).toBe(0);
      expect(result?.perceivedExertion).toBe(6);
      expect(result?.elevHigh).toBe(106.2);
      expect(result?.elevLow).toBe(5.8);
      expect(result?.gearId).toBe('b12917761');
    });

    it('generates url from id', () => {
      const result = mapActivityFromApi(apiActivity);
      expect(result?.url).toBe('https://www.strava.com/activities/17234236452');
    });

    it('converts nested gear object', () => {
      const result = mapActivityFromApi(apiActivity);
      expect(result?.gear).toEqual({
        distance: 7828686,
        id: 'b12917761',
        name: 'Cruz',
        primary: false,
        resourceState: 2,
      });
    });

    it('converts nested map object', () => {
      const result = mapActivityFromApi(apiActivity);
      expect(result?.map).toEqual({
        id: 'a17234236452',
        polyline: 'abc123',
        summaryPolyline: 'abc',
      });
    });

    it('preserves unchanged fields', () => {
      const result = mapActivityFromApi(apiActivity);
      expect(result?.id).toBe(17234236452);
      expect(result?.type).toBe('Ride');
      expect(result?.name).toBe('Morning Ride');
      expect(result?.distance).toBe(9569.5);
      expect(result?.calories).toBe(346);
      expect(result?.commute).toBe(true);
      expect(result?.description).toBe('Great ride!');
    });

    it('handles minimal API activity', () => {
      const minimal = { id: 123, type: 'Run' };
      const result = mapActivityFromApi(minimal);

      expect(result).not.toBeNull();
      expect(result?.id).toBe(123);
      expect(result?.type).toBe('Run');
      expect(result?.name).toBe('Strava Activity'); // default name
      expect(result?.url).toBe('https://www.strava.com/activities/123');
    });

    it('handles null optional fields', () => {
      const withNulls = {
        gear: null,
        id: 456,
        location_city: null,
        map: null,
        photos: null,
        type: 'Swim',
      };
      const result = mapActivityFromApi(withNulls);

      expect(result).not.toBeNull();
      expect(result?.gear).toBeNull();
      expect(result?.map).toBeNull();
      expect(result?.photos).toBeNull();
      expect(result?.locationCity).toBeNull();
    });
  });

  describe('regression: webhook update scenario', () => {
    it('correctly handles real API response with extra fields', () => {
      const realApiResponse = {
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
        end_latlng: [37.717798, -122.450229] as [number, number],
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
        location_country: null,
        location_state: null,
        map: {
          id: 'a17234236452',
          polyline: '}opeFrkcjV...',
          summary_polyline: 'gdpeF`rcjV...',
        },
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
        start_latlng: [37.77296, -122.410974] as [number, number],
        timezone: '(GMT-08:00) America/Los_Angeles',
        total_elevation_gain: 134.5,
        type: 'Ride',
        utc_offset: -28800,
        workout_type: 10,
      };

      const result = mapActivityFromApi(realApiResponse);

      // The key assertion: startDate must be present and correct (camelCase)
      expect(result?.startDate).toBe('2026-01-31T02:36:33Z');

      // Verify it's not keeping the snake_case version
      expect(result).not.toHaveProperty('start_date');

      // Other important fields
      expect(result?.name).toBe('Heated rivalry with the boysss 🔥');
      expect(result?.url).toBe('https://www.strava.com/activities/17234236452');
      expect(result?.sportType).toBe('Ride');
      expect(result?.movingTime).toBe(1610);
    });
  });
});
