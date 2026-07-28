/**
 * @jest-environment node
 */

jest.mock('../../../services/homepage', () => ({
  getHomepageDescription: jest.fn(async () => 'Engineer and problem solver.'),
}));

jest.mock('../../metadata', () => ({
  HOMEPAGE_TITLE: 'Engineer. Problem Solver.',
  metadataBase: new URL('https://dylangattey.com'),
  SITE_NAME: 'Dylan Gattey',
}));

describe('getLlmsTxt', () => {
  it('returns a curated markdown index with absolute .md links', async () => {
    const { getLlmsTxt } = await import('../getLlmsTxt');
    const body = await getLlmsTxt();

    expect(body).toContain('# Dylan Gattey');
    expect(body).toContain('https://dylangattey.com/index.md');
    expect(body).toContain('https://dylangattey.com/music.md');
    expect(body).toContain('https://dylangattey.com/llms-full.txt');
  });
});
