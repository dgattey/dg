import { fetchSideProjects } from '../fetchSideProjects';

const request = jest.fn();
const fetchAppSiteIcon = jest.fn();

jest.mock('../contentfulClient', () => ({
  getContentfulClient: () => ({
    request,
  }),
}));

jest.mock('../../appSites/fetchAppSiteIcon', () => ({
  fetchAppSiteIcon: (siteUrl: string) => fetchAppSiteIcon(siteUrl),
}));

const thumbnail = {
  height: 80,
  title: 'Mark',
  url: 'https://images.ctfassets.net/example/mark.webp',
  width: 80,
};

const liveMark = {
  height: 256,
  title: null,
  url: 'https://saga.gattey.com/icon.png',
  width: 256,
};

describe('fetchSideProjects', () => {
  beforeEach(() => {
    request.mockReset();
    fetchAppSiteIcon.mockReset();
    fetchAppSiteIcon.mockResolvedValue(null);
  });

  it('returns newest-first flagged projects and drops extras beyond five', async () => {
    request.mockResolvedValue({
      projectCollection: {
        items: [
          {
            creationDate: '2026-10-15T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://saga.gattey.com' },
            summary: 'Track books and reading progress',
            thumbnail,
            title: 'Saga',
          },
          {
            creationDate: '2026-10-14T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://sconeos.gattey.com' },
            summary: 'Spatial audio for Sonos and Spotify',
            thumbnail,
            title: 'Sconeos',
          },
          {
            creationDate: '2026-01-12T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://lostcities.gattey.com' },
            summary: 'Score Lost Cities by photo or manual entry',
            thumbnail,
            title: 'Lost Cities scorer',
          },
          {
            creationDate: '2022-05-01T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://wmm.gattey.com' },
            summary: 'See what you own and where it sits',
            thumbnail,
            title: 'WMM',
          },
          {
            creationDate: '2019-01-01T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://example.com/fifth' },
            summary: 'Still inside the homepage max',
            thumbnail,
            title: 'Fifth',
          },
          {
            creationDate: '2018-01-01T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://example.com/sixth' },
            summary: 'Older than the homepage max',
            thumbnail,
            title: 'Sixth',
          },
        ],
      },
    });
    fetchAppSiteIcon.mockImplementation((siteUrl: string) =>
      siteUrl === 'https://saga.gattey.com' ? liveMark : null,
    );

    await expect(fetchSideProjects()).resolves.toEqual([
      {
        creationDate: '2026-10-15T00:00:00.000Z',
        description: 'Track books and reading progress',
        mark: liveMark,
        title: 'Saga',
        url: 'https://saga.gattey.com',
      },
      {
        creationDate: '2026-10-14T00:00:00.000Z',
        description: 'Spatial audio for Sonos and Spotify',
        mark: thumbnail,
        title: 'Sconeos',
        url: 'https://sconeos.gattey.com',
      },
      {
        creationDate: '2026-01-12T00:00:00.000Z',
        description: 'Score Lost Cities by photo or manual entry',
        mark: thumbnail,
        title: 'Lost Cities scorer',
        url: 'https://lostcities.gattey.com',
      },
      {
        creationDate: '2022-05-01T00:00:00.000Z',
        description: 'See what you own and where it sits',
        mark: thumbnail,
        title: 'WMM',
        url: 'https://wmm.gattey.com',
      },
      {
        creationDate: '2019-01-01T00:00:00.000Z',
        description: 'Still inside the homepage max',
        mark: thumbnail,
        title: 'Fifth',
        url: 'https://example.com/fifth',
      },
    ]);
    expect(request).toHaveBeenCalledWith(
      expect.stringContaining(
        'projectCollection(limit: 5, where: { isSideProject: true }, order: creationDate_DESC)',
      ),
    );
  });

  it('returns an empty list when Contentful has no usable side projects', async () => {
    request.mockResolvedValue({
      projectCollection: {
        items: [
          {
            creationDate: '2026-07-01T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'http://insecure.example' },
            summary: 'Bad url',
            thumbnail,
            title: 'Bad',
          },
          {
            creationDate: '2026-07-01T00:00:00.000Z',
            isSideProject: false,
            link: { url: 'https://example.com' },
            summary: 'Not flagged',
            thumbnail,
            title: 'Regular',
          },
          null,
        ],
      },
    });

    await expect(fetchSideProjects()).resolves.toEqual([]);
  });
});
