import nextConfig, { resolveVersionFromTagRefs } from '../../next.config';
import vercelConfig from '../../vercel.json' with { type: 'json' };
import { getAppVersionInfo } from '../services/version';

jest.mock('@dg/services/github/fetchReleases', () => ({
  fetchReleases: jest.fn(async (options?: { fallbackVersion?: string }) => [
    {
      htmlUrl: `https://github.com/dgattey/dg/releases/tag/${options?.fallbackVersion ?? 'v2.80.0'}`,
      kind: 'patch',
      major: 2,
      minor: 85,
      name: options?.fallbackVersion ?? 'v2.80.0',
      notes: [],
      patch: 1,
      prNumbers: [],
      publishedAt: null,
      tag: options?.fallbackVersion ?? 'v2.80.0',
      version: (options?.fallbackVersion ?? 'v2.80.0').replace(/^v/, ''),
    },
  ]),
}));

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
  cacheTag: jest.fn(),
}));

describe('Vercel Function Storage and deployment configuration', () => {
  it('excludes sharp, moment locales, non-postgres dialects, and page-level OG renderer from NFT traces', () => {
    const excludes = nextConfig.outputFileTracingExcludes ?? {};
    expect(excludes['**']).toEqual(
      expect.arrayContaining([
        '../../node_modules/.pnpm/@img+sharp*/**',
        '../../node_modules/.pnpm/sharp@*/**',
        '../../node_modules/**/@img/sharp*/**',
        '../../node_modules/**/sharp/**',
        '../../node_modules/**/moment/locale/**',
        '../../node_modules/**/react/**/*.development.js',
        '../../node_modules/**/next/dist/compiled/@vercel/og/index.edge.js',
      ]),
    );
    expect(excludes['**']).not.toContain(
      '../../node_modules/**/next/dist/compiled/@vercel/og/Geist-Regular.ttf',
    );
    expect(excludes['**/page']).toEqual(
      expect.arrayContaining([
        '../../node_modules/**/next/dist/compiled/@vercel/og/**',
        './.next/server/assets/Familjen-Grotesk-*.ttf',
      ]),
    );
  });

  it('deploys only main from Git, leaving pull request previews to the Preview workflow', () => {
    expect(vercelConfig.git.deploymentEnabled).toEqual({ '**': false, main: true });
  });

  it('resolves the build version from git release tags and the commit Release info checkbox', () => {
    const tagRefs = [
      'b404267f7b7a3233c21fb3582f921f7388a0858f\trefs/tags/v2.9.1',
      '072f4193820edda7ba40f48ebfba5581d818f4da\trefs/tags/v2.81.0',
      'c19781c34bce4cd8c0e24744de6387148d1011a2\trefs/tags/v2.81.1',
    ].join('\n');

    expect(
      resolveVersionFromTagRefs({
        commitBody: '# Release info\n- [x] Patch',
        fallbackVersion: '2.80.0',
        headSha: 'c19781c34bce4cd8c0e24744de6387148d1011a2',
        tagRefsOutput: tagRefs,
      }),
    ).toBe('2.81.1');

    expect(
      resolveVersionFromTagRefs({
        commitBody: '# Release info\n- [x] Minor',
        fallbackVersion: '2.80.0',
        headSha: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        tagRefsOutput: tagRefs,
      }),
    ).toBe('2.82.0');

    expect(
      resolveVersionFromTagRefs({
        commitBody: '# Release info\n- [x] Patch',
        fallbackVersion: '2.80.0',
        headSha: 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        tagRefsOutput: tagRefs,
      }),
    ).toBe('2.81.2');
  });

  it('prefers NEXT_PUBLIC_APP_VERSION in getAppVersionInfo when present', () => {
    const previous = process.env.NEXT_PUBLIC_APP_VERSION;
    process.env.NEXT_PUBLIC_APP_VERSION = '2.82.0';
    try {
      expect(getAppVersionInfo()).toEqual({
        releaseUrl: 'https://github.com/dgattey/dg/releases/tag/v2.82.0',
        version: 'v2.82.0',
      });
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_APP_VERSION;
      } else {
        process.env.NEXT_PUBLIC_APP_VERSION = previous;
      }
    }
  });

  it('passes NEXT_PUBLIC_APP_VERSION through getChangelogReleases instead of package.json version', async () => {
    const prevVersion = process.env.NEXT_PUBLIC_APP_VERSION;
    const originalFetch = global.fetch;

    process.env.NEXT_PUBLIC_APP_VERSION = '2.85.1';
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    try {
      const { getChangelogReleases } = await import('../services/github');
      const releases = await getChangelogReleases();
      expect(releases[0]).toMatchObject({
        tag: 'v2.85.1',
        version: '2.85.1',
      });
    } finally {
      global.fetch = originalFetch;
      if (prevVersion === undefined) delete process.env.NEXT_PUBLIC_APP_VERSION;
      else process.env.NEXT_PUBLIC_APP_VERSION = prevVersion;
    }
  });
});
