import { fetchChangelogSnapshots } from '../fetchChangelogSnapshots';

const request = jest.fn();

jest.mock('../contentfulClient', () => ({
  getContentfulClient: () => ({
    request,
  }),
}));

function asset(overrides: Record<string, unknown>) {
  return {
    description: 'Homepage collage',
    fileName: 'changelog-v2.0.0.png',
    height: 800,
    title: 'Version two',
    url: 'https://images.ctfassets.net/example/changelog-v2.0.0.webp',
    width: 1200,
    ...overrides,
  };
}

describe('fetchChangelogSnapshots', () => {
  beforeEach(() => {
    request.mockReset();
  });

  it('keys photos by the version in changelog-vX.Y.Z file names and drops the rest', async () => {
    request.mockResolvedValue({
      assetCollection: {
        items: [
          asset({}),
          asset({
            description: '   ',
            fileName: 'changelog-V1.4.2.JPEG',
            title: ' Earlier ',
            url: 'https://images.ctfassets.net/example/v1.webp',
          }),
          asset({
            fileName: 'notes.txt',
            title: 'Ignored',
          }),
          asset({
            fileName: 'changelog-v3.0.0.png',
            title: '   ',
          }),
          asset({
            fileName: 'changelog-v3.1.0.webp',
            height: null,
            title: 'Missing height',
          }),
          null,
        ],
      },
    });

    const snapshots = await fetchChangelogSnapshots();

    expect([...snapshots.keys()]).toEqual(['v2.0.0', 'v1.4.2']);
    expect(snapshots.get('v2.0.0')).toEqual({
      caption: 'Homepage collage',
      height: 800,
      tag: 'v2.0.0',
      title: 'Version two',
      url: 'https://images.ctfassets.net/example/changelog-v2.0.0.webp',
      width: 1200,
    });
    expect(snapshots.get('v1.4.2')).toEqual({
      caption: null,
      height: 800,
      tag: 'v1.4.2',
      title: 'Earlier',
      url: 'https://images.ctfassets.net/example/v1.webp',
      width: 1200,
    });
  });

  it('returns an empty map when Contentful has no snapshot assets', async () => {
    request.mockResolvedValue({ assetCollection: null });

    await expect(fetchChangelogSnapshots()).resolves.toEqual(new Map());
  });
});
