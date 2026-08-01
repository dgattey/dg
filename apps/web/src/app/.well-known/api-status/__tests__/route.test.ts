/**
 * @jest-environment node
 */

describe('API status route', () => {
  it('reports the public discovery surface as available', async () => {
    const { GET } = await import('../route');
    const response = GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });
});
