import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import {
  compareReleasesDesc,
  createFallbackRelease,
  extractPrNumbers,
  fetchReleases,
  normalizeGitHubRelease,
  parseReleaseBody,
  parseSemverTag,
  upsertRelease,
} from '../fetchReleases';

describe('fetchReleases', () => {
  const db = setupTestDatabase();
  const originalFetch = global.fetch;

  beforeEach(async () => {
    await db.Release.destroy({ where: {} });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('classifies major, minor, and patch semver tags', () => {
    expect(parseSemverTag('v2.0.0')).toEqual({
      kind: 'major',
      major: 2,
      minor: 0,
      patch: 0,
      version: '2.0.0',
    });
    expect(parseSemverTag('v0.0.0')).toEqual({
      kind: 'minor',
      major: 0,
      minor: 0,
      patch: 0,
      version: '0.0.0',
    });
    expect(parseSemverTag('v2.80.0')).toEqual({
      kind: 'minor',
      major: 2,
      minor: 80,
      patch: 0,
      version: '2.80.0',
    });
    expect(parseSemverTag('2.80.1')).toEqual({
      kind: 'patch',
      major: 2,
      minor: 80,
      patch: 1,
      version: '2.80.1',
    });
    expect(parseSemverTag('not-a-tag')).toBeNull();
  });

  it('cleans release bodies and extracts PR numbers across formats', () => {
    const modernBody = [
      '<!-- CURSOR_AGENT_PR_BODY_BEGIN -->',
      '- **Live icons for DylKit apps.** Reads the first 24 bytes from `/icon.png` in #660.',
      '  - Indented detail that stays out of top-level bullets.',
      '- Second bullet with [PR link](https://github.com/dgattey/dg/pull/661).',
      '',
      'Closes DG-282',
    ].join('\n');

    expect(parseReleaseBody(modernBody)).toEqual({
      notes: [
        'Live icons for DylKit apps. Reads the first 24 bytes from /icon.png in #660.',
        'Second bullet with PR link (#661).',
      ],
      prNumbers: [660, 661],
    });

    const semanticReleaseBody = [
      '## [2.46.9](https://github.com/dgattey/dg/compare/v2.46.8...v2.46.9) (2023-10-08)',
      '',
      '### Bug Fixes',
      '',
      '* [Releases] swap to prebuilt deploys ([#411](https://github.com/dgattey/dg/issues/411)) ([b7cac91](https://github.com/dgattey/dg/commit/b7cac91868a163c9e2fce1a5be663b342cdb691c))',
    ].join('\n');

    expect(parseReleaseBody(semanticReleaseBody)).toEqual({
      notes: ['[Releases] swap to prebuilt deploys (#411)'],
      prNumbers: [411],
    });
  });

  it('extracts explicit pull request references and ignores bare hash numbers in prose', () => {
    expect(
      extractPrNumbers('Merged #517 and https://github.com/dgattey/dg/pull/652 plus (#517) again.'),
    ).toEqual([652, 517]);
    expect(
      extractPrNumbers('Added a Top playlists card with the #1 song from each playlist (#702).'),
    ).toEqual([702]);
    expect(extractPrNumbers('the #1 song')).toEqual([]);
    expect(extractPrNumbers('#1 neighborhood')).toEqual([]);
  });

  it('skips draft and prerelease entries when normalizing', () => {
    expect(normalizeGitHubRelease({ draft: true, tag_name: 'v2.90.0' })).toBeNull();
    expect(normalizeGitHubRelease({ prerelease: true, tag_name: 'v2.90.0' })).toBeNull();
    expect(
      normalizeGitHubRelease({
        body: '- Added changelog page',
        html_url: 'https://github.com/dgattey/dg/releases/tag/v2.81.0',
        name: 'v2.81.0',
        published_at: '2026-10-22T18:00:00Z',
        tag_name: 'v2.81.0',
      }),
    ).toEqual({
      htmlUrl: 'https://github.com/dgattey/dg/releases/tag/v2.81.0',
      kind: 'minor',
      major: 2,
      minor: 81,
      name: 'v2.81.0',
      notes: ['Added changelog page'],
      patch: 0,
      prNumbers: [],
      publishedAt: '2026-10-22T18:00:00Z',
      tag: 'v2.81.0',
      version: '2.81.0',
    });
  });

  it('reads releases directly from the Release table without calling GitHub when populated', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    await upsertRelease({
      body: '- Initial AngularJS and WordPress JSON prototype.',
      publishedAt: '2016-03-18T03:01:27.000Z',
      url: 'https://github.com/dgattey/dg/commit/f6e39c594ca757f4a80da1801f4b8541db7bc9a3',
      version: 'v0.0.0',
    });
    await upsertRelease({
      body: '- Standardized the site-wide typography scale (#690).',
      publishedAt: '2026-10-24T07:24:11.000Z',
      url: 'https://github.com/dgattey/dg/releases/tag/v2.85.7',
      version: '2.85.7',
    });

    const releases = await fetchReleases({ fallbackVersion: '2.85.7' });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(releases.map((r) => r.tag)).toEqual(['v2.85.7', 'v0.0.0']);
    expect(releases[0]?.notes).toEqual(['Standardized the site-wide typography scale (#690).']);
    expect(releases[0]?.prNumbers).toEqual([690]);
  });

  it('paginates through GitHub release pages when the Release table is empty', async () => {
    const page1 = Array.from({ length: 100 }, (_, i) => ({
      body: `- Release ${i + 1}`,
      html_url: `https://github.com/dgattey/dg/releases/tag/v2.${i}.0`,
      name: `v2.${i}.0`,
      published_at: '2026-10-20T00:00:00Z',
      tag_name: `v2.${i}.0`,
    }));
    const page2 = [
      {
        body: '- Initial release',
        html_url: 'https://github.com/dgattey/dg/releases/tag/v1.0.0',
        name: 'v1.0.0',
        published_at: '2021-02-14T00:00:00Z',
        tag_name: 'v1.0.0',
      },
    ];

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        json: async () => page1,
        ok: true,
      })
      .mockResolvedValueOnce({
        json: async () => page2,
        ok: true,
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    const releases = await fetchReleases({ fallbackVersion: '2.99.0' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(releases).toHaveLength(101);
    expect(releases[0]?.tag).toBe('v2.99.0');
    expect(releases.at(-1)?.tag).toBe('v1.0.0');
  });

  it('returns the fallback release when the Release table is empty and the GitHub API fails', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const releases = await fetchReleases({ fallbackVersion: '2.80.1' });
    expect(releases).toEqual([createFallbackRelease('2.80.1')]);
  });

  it('returns the normalized release even when persisting to the database fails', async () => {
    const upsertSpy = jest
      .spyOn(db.Release, 'upsert')
      .mockRejectedValueOnce(new Error('Neon network transfer limit exceeded'));
    try {
      const release = await upsertRelease({
        body: '- Graceful changelog release sync (#711).',
        publishedAt: '2026-10-24T15:00:00.000Z',
        url: 'https://github.com/dgattey/dg/releases/tag/v2.90.4',
        version: '2.90.4',
      });
      expect(release).toMatchObject({
        notes: ['Graceful changelog release sync (#711).'],
        tag: 'v2.90.4',
        version: '2.90.4',
      });
    } finally {
      upsertSpy.mockRestore();
    }
  });

  it('sorts releases by major, minor, then patch descending', () => {
    const a = createFallbackRelease('1.24.0');
    const b = createFallbackRelease('2.0.0');
    const c = createFallbackRelease('2.80.1');
    expect([a, b, c].sort(compareReleasesDesc).map((r) => r.tag)).toEqual([
      'v2.80.1',
      'v2.0.0',
      'v1.24.0',
    ]);
  });
});
