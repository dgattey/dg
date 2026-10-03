import { fetchCurrentLocation } from '../fetchCurrentLocation';

const request = jest.fn();

jest.mock('../contentfulClient', () => ({
  getContentfulClient: () => ({ request }),
}));

describe('fetchCurrentLocation', () => {
  it('keeps the map for a location without a title', async () => {
    request.mockResolvedValue({
      contentTypeLocation: { point: { latitude: 37.7, longitude: -122.4 }, zoomLevels: [11] },
    });

    await expect(fetchCurrentLocation()).resolves.toMatchObject({
      point: { latitude: 37.7, longitude: -122.4 },
    });
  });
});
