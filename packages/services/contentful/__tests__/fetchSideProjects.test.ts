import { fetchSideProjects } from '../fetchSideProjects';

const request = jest.fn();

jest.mock('../contentfulClient', () => ({
  getContentfulClient: () => ({
    request,
  }),
}));

const mark = {
  height: 80,
  title: 'Mark',
  url: 'https://images.ctfassets.net/example/mark.webp',
  width: 80,
};

describe('fetchSideProjects', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('returns newest-first projects and drops extras beyond two', async () => {
    request.mockResolvedValue({
      sideProjectCollection: {
        items: [
          {
            description: 'Newest description',
            mark,
            publishedAt: '2026-07-02T00:00:00.000Z',
            title: 'Newest',
            url: 'https://example.com/newest',
          },
          {
            description: 'Second description',
            mark,
            publishedAt: '2026-07-01T00:00:00.000Z',
            title: 'Second',
            url: 'https://example.com/second',
          },
          {
            description: 'Should be ignored',
            mark,
            publishedAt: '2026-06-01T00:00:00.000Z',
            title: 'Third',
            url: 'https://example.com/third',
          },
        ],
      },
    });

    await expect(fetchSideProjects()).resolves.toEqual([
      {
        description: 'Newest description',
        mark: {
          height: 80,
          title: 'Mark',
          url: 'https://images.ctfassets.net/example/mark.webp',
          width: 80,
        },
        publishedAt: '2026-07-02T00:00:00.000Z',
        title: 'Newest',
        url: 'https://example.com/newest',
      },
      {
        description: 'Second description',
        mark: {
          height: 80,
          title: 'Mark',
          url: 'https://images.ctfassets.net/example/mark.webp',
          width: 80,
        },
        publishedAt: '2026-07-01T00:00:00.000Z',
        title: 'Second',
        url: 'https://example.com/second',
      },
    ]);
  });

  it('returns an empty list when Contentful has no usable projects', async () => {
    request.mockResolvedValue({
      sideProjectCollection: {
        items: [
          {
            description: 'Bad url',
            mark,
            publishedAt: '2026-07-01T00:00:00.000Z',
            title: 'Bad',
            url: 'http://insecure.example',
          },
          null,
        ],
      },
    });

    await expect(fetchSideProjects()).resolves.toEqual([]);
  });
});
