/**
 * @jest-environment node
 */

jest.mock('../../../metadata', () => ({
  metadataBase: new URL('https://dylangattey.com'),
  SITE_NAME: 'Dylan Gattey',
}));

describe('content discovery OpenAPI route', () => {
  it('describes the public discovery endpoints without private integrations', async () => {
    const { GET } = await import('../route');
    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.oai.openapi+json;version=3.1.0',
    );
    expect(body.openapi).toBe('3.1.0');
    expect(body.servers).toEqual([{ url: 'https://dylangattey.com' }]);
    expect(Object.keys(body.paths)).toEqual(
      expect.arrayContaining([
        '/',
        '/index.md',
        '/llms-full.txt',
        '/llms.txt',
        '/music',
        '/music.md',
        '/music/albums',
        '/music/albums.md',
        '/robots.txt',
        '/sitemap.xml',
      ]),
    );
    expect(JSON.stringify(body)).not.toContain('/api/');
  });
});
