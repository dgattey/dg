/**
 * @jest-environment node
 */

jest.mock('../../../metadata', () => ({
  metadataBase: new URL('https://dylangattey.com'),
}));

describe('API catalog route', () => {
  it('returns a profiled RFC 9727 Linkset for the public content API', async () => {
    const { GET } = await import('../route');
    const response = GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    );
    expect(response.headers.get('Link')).toContain('rel="api-catalog"');
    expect(body).toEqual({
      linkset: [
        {
          anchor: 'https://dylangattey.com/',
          'service-desc': [
            {
              href: 'https://dylangattey.com/.well-known/openapi.json',
              type: 'application/vnd.oai.openapi+json;version=3.1.0',
            },
          ],
          'service-doc': [
            {
              href: 'https://dylangattey.com/llms.txt',
              type: 'text/markdown',
            },
          ],
          status: [
            {
              href: 'https://dylangattey.com/.well-known/api-status',
              type: 'application/json',
            },
          ],
        },
      ],
    });
    expect(JSON.stringify(body)).not.toContain('/api/');
  });

  it('returns catalog headers and no body for HEAD', async () => {
    const { HEAD } = await import('../route');
    const response = HEAD();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('application/linkset+json');
    expect(response.headers.get('Link')).toContain('rel="api-catalog"');
    expect(await response.text()).toBe('');
  });
});
