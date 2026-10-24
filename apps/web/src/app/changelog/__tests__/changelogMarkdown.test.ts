import type { ChangelogRelease } from '@dg/services/github/fetchReleases';

jest.mock('../../../services/github', () => ({
  getChangelogReleases: jest.fn(),
}));

import { getChangelogReleases } from '../../../services/github';
import { getChangelogMarkdown } from '../changelogMarkdown';

const mockGetChangelogReleases = jest.mocked(getChangelogReleases);

const release = (
  overrides: Partial<ChangelogRelease> & Pick<ChangelogRelease, 'tag'>,
): ChangelogRelease => ({
  htmlUrl: `https://github.com/dgattey/dg/releases/tag/${overrides.tag}`,
  kind: 'patch',
  major: 2,
  minor: 0,
  name: overrides.tag,
  notes: [],
  patch: 0,
  prNumbers: [],
  publishedAt: '2023-12-30T10:04:33Z',
  version: overrides.tag.replace(/^v/, ''),
  ...overrides,
});

describe('getChangelogMarkdown', () => {
  it('lists a snapshot url under the release that has one', async () => {
    mockGetChangelogReleases.mockResolvedValue([
      release({
        notes: ['Starts using Gatsby as source of truth.'],
        snapshot: {
          caption: 'Launch day.',
          height: 800,
          tag: 'v2.0.0',
          title: 'Version two',
          url: 'https://images.ctfassets.net/example/changelog-v2.0.0.webp',
          width: 1200,
        },
        tag: 'v2.0.0',
      }),
      release({ tag: 'v1.4.2' }),
    ]);

    const markdown = await getChangelogMarkdown();

    expect(markdown).toContain(
      '  - Snapshot (Version two): https://images.ctfassets.net/example/changelog-v2.0.0.webp',
    );
    const unpictured = markdown.split('\n').find((line) => line.includes('v1.4.2'));
    expect(unpictured).toBeDefined();
    expect(unpictured).not.toContain('Snapshot');
  });
});
