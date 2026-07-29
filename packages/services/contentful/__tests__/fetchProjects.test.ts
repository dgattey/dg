import { fetchProjects } from '../fetchProjects';

const request = jest.fn();

jest.mock('../contentfulClient', () => ({
  getContentfulClient: () => ({
    request,
  }),
}));

const thumbnail = {
  height: 480,
  url: 'https://images.ctfassets.net/example/image.webp',
  width: 640,
};

describe('fetchProjects', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('excludes flagged side projects even if Contentful returns them', async () => {
    request.mockResolvedValue({
      projectCollection: {
        items: [
          {
            creationDate: '2026-07-01',
            description: { json: { content: [], nodeType: 'document' } },
            isSideProject: false,
            layout: 'default',
            link: { url: 'https://example.com/regular' },
            thumbnail,
            title: 'Regular',
            type: ['Web'],
          },
          {
            creationDate: '2026-07-02',
            description: { json: { content: [], nodeType: 'document' } },
            isSideProject: true,
            layout: 'default',
            link: { url: 'https://wmm.gattey.com' },
            summary: 'Side',
            thumbnail,
            title: 'WMM',
            type: ['Web'],
          },
          {
            creationDate: '2026-06-01',
            description: { json: { content: [], nodeType: 'document' } },
            isSideProject: null,
            layout: 'default',
            link: { url: 'https://example.com/unset' },
            thumbnail,
            title: 'Unset flag',
            type: ['Web'],
          },
        ],
      },
    });

    const projects = await fetchProjects();
    expect(projects.map((project) => project.title)).toEqual(['Regular', 'Unset flag']);
  });
});
