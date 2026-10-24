import { getContentfulClient } from '../contentfulClient';
import { fetchFooterContent } from '../fetchFooterContent';
import { fetchHeaderContent } from '../fetchHeaderContent';

jest.mock('../contentfulClient', () => ({
  getContentfulClient: jest.fn(),
}));

describe('fetchFooterContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the Contentful footer description rich text, section titles, links, and block order directly', async () => {
    const contentfulText =
      'Building from San Francisco. Come talk my ear off about plants, house projects, and hydration ratios. Bring more color to the world 🌈';
    jest.mocked(getContentfulClient).mockReturnValue({
      request: jest.fn().mockResolvedValue({
        sectionCollection: {
          items: [
            {
              blocksCollection: {
                items: [
                  {
                    blocksCollection: {
                      items: [
                        {
                          icon: 'cursor',
                          title: 'Cursor',
                          url: 'https://cursor.com/@dyl',
                        },
                        {
                          icon: 'github',
                          title: 'GitHub',
                          url: 'https://github.com/dgattey',
                        },
                      ],
                    },
                    slug: 'footer-elsewhere',
                    title: 'Elsewhere',
                  },
                  {
                    content: {
                      json: {
                        content: [
                          {
                            content: [
                              {
                                data: {},
                                marks: [],
                                nodeType: 'text',
                                value: contentfulText,
                              },
                            ],
                            data: {},
                            nodeType: 'paragraph',
                          },
                        ],
                        data: {},
                        nodeType: 'document',
                      },
                      links: {
                        assets: { block: [] },
                        entries: { block: [], inline: [] },
                      },
                    },
                    slug: 'footer',
                    title: 'Say hello',
                  },
                  {
                    icon: 'email',
                    title: 'Email me',
                    url: 'mailto:dylan@gattey.com',
                  },
                ],
              },
            },
          ],
        },
      }),
    } as unknown as ReturnType<typeof getContentfulClient>);

    const result = await fetchFooterContent();
    expect(result.helloTitle).toBe('Say hello');
    expect(result.elsewhereTitle).toBe('Elsewhere');
    expect(result.sectionOrder).toEqual(['elsewhere', 'hello']);
    expect(result.links).toEqual([
      { icon: 'cursor', title: 'Cursor', url: 'https://cursor.com/@dyl' },
      { icon: 'github', title: 'GitHub', url: 'https://github.com/dgattey' },
      { icon: 'email', title: 'Email me', url: 'mailto:dylan@gattey.com' },
    ]);
    expect(result.description?.json).toEqual({
      content: [
        {
          content: [
            {
              data: {},
              marks: [],
              nodeType: 'text',
              value: contentfulText,
            },
          ],
          data: {},
          nodeType: 'paragraph',
        },
      ],
      data: {},
      nodeType: 'document',
    });
  });
});

describe('fetchHeaderContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps nested Section blocks to dropdown menus and Link blocks to top-level nav links in Contentful order', async () => {
    jest.mocked(getContentfulClient).mockReturnValue({
      request: jest.fn().mockResolvedValue({
        sectionCollection: {
          items: [
            {
              blocksCollection: {
                items: [
                  {
                    blocksCollection: {
                      items: [
                        {
                          icon: 'stats',
                          title: 'Listening stats',
                          url: '/music/stats',
                        },
                        {
                          icon: 'history',
                          title: 'Plays',
                          url: '/music',
                        },
                        {
                          icon: 'albums',
                          title: 'Favorite albums',
                          url: '/music/albums',
                        },
                      ],
                    },
                    slug: 'header-music',
                    title: 'Music',
                  },
                  {
                    icon: 'reading',
                    title: 'Reads',
                    url: '/reading',
                  },
                  {
                    icon: 'map',
                    title: 'Big map',
                    url: '/activities',
                  },
                ],
              },
              slug: 'header',
              title: 'Website header',
            },
          ],
        },
      }),
    } as unknown as ReturnType<typeof getContentfulClient>);

    await expect(fetchHeaderContent()).resolves.toEqual({
      items: [
        {
          kind: 'menu',
          links: [
            { icon: 'stats', title: 'Listening stats', url: '/music/stats' },
            { icon: 'history', title: 'Plays', url: '/music' },
            { icon: 'albums', title: 'Favorite albums', url: '/music/albums' },
          ],
          slug: 'header-music',
          title: 'Music',
        },
        {
          kind: 'link',
          link: { icon: 'reading', title: 'Reads', url: '/reading' },
        },
        {
          kind: 'link',
          link: { icon: 'map', title: 'Big map', url: '/activities' },
        },
      ],
    });
  });
});
