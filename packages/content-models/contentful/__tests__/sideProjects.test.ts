import {
  SIDE_PROJECTS_LIMIT,
  takeNewestSideProjects,
  toRenderableSideProject,
} from '../renderables/sideProjects';

const mark = {
  height: 80,
  title: 'Mark',
  url: 'https://images.ctfassets.net/example/mark.webp',
  width: 80,
};

describe('side project renderables', () => {
  it('maps valid side projects and rejects unsafe or incomplete entries', () => {
    expect(
      toRenderableSideProject({
        description: 'See what you own and where it sits',
        mark,
        publishedAt: '2026-07-01T00:00:00.000Z',
        title: 'WMM',
        url: 'https://wmm.gattey.com',
      }),
    ).toEqual({
      description: 'See what you own and where it sits',
      mark: {
        height: 80,
        title: 'Mark',
        url: 'https://images.ctfassets.net/example/mark.webp',
        width: 80,
      },
      publishedAt: '2026-07-01T00:00:00.000Z',
      title: 'WMM',
      url: 'https://wmm.gattey.com',
    });

    expect(
      toRenderableSideProject({
        description: 'Nope',
        mark,
        title: 'Insecure',
        url: 'http://example.com',
      }),
    ).toBeNull();
    expect(
      toRenderableSideProject({
        description: 'Nope',
        mark,
        title: 'Script',
        url: 'javascript:alert(1)',
      }),
    ).toBeNull();
    expect(
      toRenderableSideProject({
        description: 'Nope',
        mark: { ...mark, url: null },
        title: 'Missing mark',
        url: 'https://example.com',
      }),
    ).toBeNull();
    expect(toRenderableSideProject({ mark, title: null, url: 'https://example.com' })).toBeNull();
  });

  it('orders newest first and keeps only the homepage max', () => {
    const selected = takeNewestSideProjects([
      {
        description: 'Oldest',
        mark,
        publishedAt: '2024-01-01T00:00:00.000Z',
        title: 'Oldest',
        url: 'https://example.com/oldest',
      },
      {
        description: 'Newest',
        mark,
        publishedAt: '2026-07-01T00:00:00.000Z',
        title: 'Newest',
        url: 'https://example.com/newest',
      },
      {
        description: 'Middle',
        mark,
        publishedAt: '2025-06-01T00:00:00.000Z',
        title: 'Middle',
        url: 'https://example.com/middle',
      },
    ]);

    expect(SIDE_PROJECTS_LIMIT).toBe(2);
    expect(selected).toHaveLength(2);
    expect(selected.map((project) => project.title)).toEqual(['Newest', 'Middle']);
  });
});
