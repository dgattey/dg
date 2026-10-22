import {
  compareReleasesDesc,
  createFallbackRelease,
  extractPrNumbers,
  fetchReleases,
  normalizeGitHubRelease,
  parseReleaseBody,
  parseSemverTag,
} from '../fetchReleases';

describe('fetchReleases', () => {
  const originalFetch = global.fetch;

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
      '## Verification',
      '- `turbo check` passes.',
      '',
      'Closes DG-282',
    ].join('\n');

    expect(parseReleaseBody(modernBody)).toEqual({
      notes: [
        '**Live icons for DylKit apps.** Reads the first 24 bytes from `/icon.png` in #660.',
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

  it('extracts unique PR numbers from release text', () => {
    expect(
      extractPrNumbers('Merged #517 and https://github.com/dgattey/dg/pull/652 plus (#517) again.'),
    ).toEqual([517, 652]);
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

  it('paginates through all GitHub release pages and sorts descending by semver', async () => {
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

  it('returns the fallback release when the GitHub API fails', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network down')) as unknown as typeof fetch;

    const releases = await fetchReleases({ fallbackVersion: '2.80.1' });
    expect(releases).toEqual([createFallbackRelease('2.80.1')]);
  });

  it('merges baseline archive releases when includeBaseline is enabled', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => [],
      ok: false,
      status: 403,
    }) as unknown as typeof fetch;

    const releases = await fetchReleases({
      fallbackVersion: '2.80.1',
      includeBaseline: true,
    });
    expect(releases.length).toBeGreaterThanOrEqual(296);
    expect(releases[0]?.tag).toBe('v2.80.1');
    expect(releases.at(-1)?.tag).toBe('v1.21.5');
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
