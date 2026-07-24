import { fetchSideProjects } from '../fetchSideProjects';

const request = jest.fn();

jest.mock('../contentfulClient', () => ({
  getContentfulClient: () => ({
    request,
  }),
}));

const thumbnail = {
  height: 80,
  title: 'Mark',
  url: 'https://images.ctfassets.net/example/mark.webp',
  width: 80,
};

describe('fetchSideProjects', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('returns newest-first flagged projects and drops extras beyond two', async () => {
    request.mockResolvedValue({
      projectCollection: {
        items: [
          {
            creationDate: '2026-07-02T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://example.com/newest' },
            summary: 'Newest description',
            thumbnail,
            title: 'Newest',
          },
          {
            creationDate: '2026-07-01T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://example.com/second' },
            summary: 'Second description',
            thumbnail,
            title: 'Second',
          },
          {
            creationDate: '2026-06-01T00:00:00.000Z',
            isSideProject: true,
            link: { url: 'https://example.com/third' },
            summary: 'Should be ignored',
            thumbnail,
            title: 'Third',
          },
        ],
      },
    });

    await expect(fetchSideProjects()).resolves.toEqual([
      {
        creationDate: '2026-07-02T00:00:00.000Z',
        description: 'Newest description',
        mark: {
          height: 80,
          title: 'Mark',
          url: 'https://images.ctfassets.net/example/mark.webp',
          width: 80,
        },
        title: 'Newest',
        url: 'https://example.com/newest',
      },
      {
        creationDate: '2026-07-01T00:00:00.000Z',
        description: 'Second description',
        mark: {
          height: 80,
          title: 'Mark',
          url: 'https://images.ctfassets.net/example/mark.webp',
          width: 80,
        },
        title: 'Second',
        url: 'https://example.com/second',
      },
    ]);
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
