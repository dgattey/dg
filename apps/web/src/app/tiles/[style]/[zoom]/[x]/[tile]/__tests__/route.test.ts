/**
 * @jest-environment node
 */

import { GET } from '../route';

const tileSource = jest.fn();

jest.mock('@dg/maps/src/getTileSource', () => ({
  getTileSource: () => tileSource(),
}));

const get = (params: { style: string; tile: string; x: string; zoom: string }) =>
  GET(new Request('http://localhost/tiles'), { params: Promise.resolve(params) });

describe('offline tile route', () => {
  beforeEach(() => {
    tileSource.mockReturnValue({ mode: 'offline' });
  });

  it('serves a labelled svg tile at the Stadia path', async () => {
    const response = await get({ style: 'outdoors', tile: '395@2x.png', x: '163', zoom: '10' });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/svg+xml');
    const svg = await response.text();
    expect(svg).toContain('>163/395<');
    expect(svg).toContain('>@2x<');
  });

  it.each([
    { style: 'outdoors', tile: '395.webp', x: '163', zoom: '10' },
    { style: 'outdoors', tile: '395.png', x: '16a', zoom: '10' },
    { style: 'outdoors', tile: '395.png', x: '163', zoom: '-1' },
  ])('rejects malformed coordinates %o', async (params) => {
    expect((await get(params)).status).toBe(404);
  });

  it('is not served when maps use Stadia', async () => {
    tileSource.mockReturnValue({ apiKey: null, mode: 'stadia' });

    expect((await get({ style: 'outdoors', tile: '395.png', x: '163', zoom: '10' })).status).toBe(
      404,
    );
  });
});
