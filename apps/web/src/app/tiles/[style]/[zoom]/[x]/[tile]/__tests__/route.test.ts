/**
 * @jest-environment node
 */

import { ImageResponse } from 'next/og';
import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GET } from '../route';

const tileSource = jest.fn();

jest.mock('@dg/maps/src/getTileSource', () => ({
  getTileSource: () => tileSource(),
}));

// @vercel/og ships ESM with `import.meta`, which this Jest setup cannot load.
jest.mock('next/og', () => ({
  ImageResponse: jest.fn(() => new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))),
}));

const get = (params: { style: string; tile: string; x: string; zoom: string }) =>
  GET(new Request('http://localhost/tiles'), { params: Promise.resolve(params) });

const rendered = () => {
  const [element, options] = jest.mocked(ImageResponse).mock.calls[0] ?? [];
  if (!isValidElement(element)) throw new Error('No tile rendered');
  return { markup: renderToStaticMarkup(element), options };
};

describe('offline tile route', () => {
  beforeEach(() => {
    jest.mocked(ImageResponse).mockClear();
    tileSource.mockReturnValue({ mode: 'offline' });
  });

  it('renders a labelled retina tile at the Stadia path', async () => {
    const response = await get({ style: 'outdoors', tile: '395@2x.png', x: '163', zoom: '10' });

    expect(response.status).toBe(200);
    const { markup, options } = rendered();
    expect(markup).toContain('>z10<');
    expect(markup).toContain('>163/395<');
    expect(markup).toContain('>@2x<');
    expect(options).toMatchObject({ height: 512, width: 512 });
  });

  it('renders standard tiles at 256px', async () => {
    await get({ style: 'stamen_watercolor', tile: '5.jpg', x: '4', zoom: '6' });

    expect(rendered().options).toMatchObject({ height: 256, width: 256 });
  });

  it.each([
    { style: 'outdoors', tile: '395.webp', x: '163', zoom: '10' },
    { style: 'outdoors', tile: '395.png', x: '16a', zoom: '10' },
    { style: 'outdoors', tile: '395.png', x: '163', zoom: '-1' },
  ])('rejects malformed coordinates %o', async (params) => {
    expect((await get(params)).status).toBe(404);
    expect(ImageResponse).not.toHaveBeenCalled();
  });

  it('is not served when maps use Stadia', async () => {
    tileSource.mockReturnValue({ apiKey: null, mode: 'stadia' });

    expect((await get({ style: 'outdoors', tile: '395.png', x: '163', zoom: '10' })).status).toBe(
      404,
    );
  });
});
