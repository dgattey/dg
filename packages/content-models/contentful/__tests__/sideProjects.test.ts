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
        creationDate: '2019-01-01T00:00:00.000Z',
        description: 'Dropped older project',
        mark: thumbnail,
        title: 'Dropped',
        url: 'https://example.com/dropped',
      },
      {
        creationDate: '2026-10-15T00:00:00.000Z',
        description: 'Track books and reading progress',
        mark: thumbnail,
        title: 'Saga',
        url: 'https://saga.gattey.com',
      },
      {
        creationDate: '2022-05-01T00:00:00.000Z',
        description: 'See what you own and where it sits',
        mark: thumbnail,
        title: 'WMM',
        url: 'https://wmm.gattey.com',
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
    ]);

    expect(SIDE_PROJECTS_LIMIT).toBe(4);
    expect(selected).toHaveLength(4);
    expect(selected.map((project) => project.title)).toEqual([
      'Saga',
      'Sconeos',
      'Lost Cities scorer',
      'WMM',
    ]);
  });
});
