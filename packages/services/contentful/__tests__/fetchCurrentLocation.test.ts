import { fetchCurrentLocation } from '../fetchCurrentLocation';

const request = jest.fn();

jest.mock('../contentfulClient', () => ({
  getContentfulClient: () => ({
    request,
  }),
}));

describe('fetchCurrentLocation', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('maps the real location name, point, marker, and ordered zoom levels', async () => {
    request.mockResolvedValue({
      contentTypeLocation: {
        image: {
          height: 170,
          title: 'Location marker',
          url: 'https://images.ctfassets.net/example/marker.webp',
          width: 170,
        },
        initialZoom: 11,
        point: {
          latitude: 37.72349,
          longitude: -122.453,
        },
        title: ' San Francisco ',
        zoomLevels: [12, '10', 11],
      },
    });

    await expect(fetchCurrentLocation()).resolves.toEqual({
      image: {
        height: 170,
        title: 'Location marker',
        url: 'https://images.ctfassets.net/example/marker.webp',
        width: 170,
      },
      initialZoom: 11,
      point: {
        latitude: 37.72349,
        longitude: -122.453,
      },
      title: 'San Francisco',
      zoomLevels: [10, 11, 12],
    });
  });

  it('omits a location without a usable name', async () => {
    request.mockResolvedValue({
      contentTypeLocation: {
        point: {
          latitude: 37.72349,
          longitude: -122.453,
        },
        title: ' ',
        zoomLevels: [11],
      },
    });

    await expect(fetchCurrentLocation()).resolves.toBeNull();
  });
});
