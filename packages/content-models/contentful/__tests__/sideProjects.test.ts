import {
  SIDE_PROJECTS_LIMIT,
  takeNewestSideProjects,
  toRenderableSideProject,
} from '../renderables/sideProjects';

const thumbnail = {
  height: 80,
  title: 'Mark',
  url: 'https://images.ctfassets.net/example/mark.webp',
  width: 80,
};

describe('side project renderables', () => {
  it('maps flagged projects and rejects unsafe, incomplete, or unflagged entries', () => {
    expect(
      toRenderableSideProject({
        creationDate: '2026-07-01T00:00:00.000Z',
        isSideProject: true,
        link: { url: 'https://wmm.gattey.com' },
        summary: 'See what you own and where it sits',
        thumbnail,
        title: 'WMM',
      }),
    ).toEqual({
      creationDate: '2026-07-01T00:00:00.000Z',
      description: 'See what you own and where it sits',
      mark: {
        height: 80,
        title: 'Mark',
        url: 'https://images.ctfassets.net/example/mark.webp',
        width: 80,
      },
      title: 'WMM',
      url: 'https://wmm.gattey.com',
    });

    expect(
      toRenderableSideProject({
        isSideProject: false,
        link: { url: 'https://example.com' },
        summary: 'Nope',
        thumbnail,
        title: 'Regular',
      }),
    ).toBeNull();
    expect(
      toRenderableSideProject({
        isSideProject: true,
        link: { url: 'http://example.com' },
        summary: 'Nope',
        thumbnail,
        title: 'Insecure',
      }),
    ).toBeNull();
    expect(
      toRenderableSideProject({
        isSideProject: true,
        link: { url: 'https://example.com' },
        summary: 'Nope',
        thumbnail: { ...thumbnail, url: null },
        title: 'Missing mark',
      }),
    ).toBeNull();
    expect(
      toRenderableSideProject({
        isSideProject: true,
        link: { url: 'https://example.com' },
        summary: null,
        thumbnail,
        title: 'Missing summary',
      }),
    ).toBeNull();
  });

  it('orders newest first by creationDate and keeps only the homepage max', () => {
    const selected = takeNewestSideProjects([
      {
        creationDate: '2024-01-01T00:00:00.000Z',
        description: 'Oldest',
        mark: thumbnail,
        title: 'Oldest',
        url: 'https://example.com/oldest',
      },
      {
        creationDate: '2026-07-01T00:00:00.000Z',
        description: 'Newest',
        mark: thumbnail,
        title: 'Newest',
        url: 'https://example.com/newest',
      },
      {
        creationDate: '2025-06-01T00:00:00.000Z',
        description: 'Middle',
        mark: thumbnail,
        title: 'Middle',
        url: 'https://example.com/middle',
      },
    ]);

    expect(SIDE_PROJECTS_LIMIT).toBe(2);
    expect(selected).toHaveLength(2);
    expect(selected.map((project) => project.title)).toEqual(['Newest', 'Middle']);
  });
});
