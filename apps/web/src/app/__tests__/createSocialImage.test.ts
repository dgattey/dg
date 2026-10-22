jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
}));

// @vercel/og ships ESM with `import.meta`, which this Jest setup cannot load.
jest.mock('next/og', () => ({
  ImageResponse: jest.fn(() => new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))),
}));

jest.mock('@dg/services/contentful/fetchIntroContent', () => ({
  fetchIntroContent: jest.fn(),
}));

import type { IntroContent } from '@dg/content-models/contentful/renderables/intro';
import { fetchIntroContent } from '@dg/services/contentful/fetchIntroContent';
import { ImageResponse } from 'next/og';
import { isValidElement } from 'react';
import { createSocialImage } from '../createSocialImage';
import { HOMEPAGE_TITLE, SITE_NAME } from '../metadata';

const TRUETYPE_SFNT_VERSION = 0x00010000;

const intro: IntroContent = {
  image: { height: 800, url: 'https://images.ctfassets.net/dylan.png?fm=webp&w=800', width: 800 },
  textBlock: {
    content: {
      json: {
        content: [
          {
            content: [{ data: {}, marks: [], nodeType: 'text', value: 'Hey friends!' }],
            data: {},
            nodeType: 'heading-1',
          },
        ],
        data: {},
        nodeType: 'document',
      },
      links: { assets: { block: [] }, entries: { block: [], inline: [] } },
    },
  },
};

async function renderCard() {
  const response = await createSocialImage();
  const [card, options] = jest.mocked(ImageResponse).mock.lastCall ?? [];
  if (!isValidElement<Record<string, unknown>>(card) || !options) {
    throw new Error('ImageResponse was not called with a card element');
  }
  return { card, options, response };
}

describe('createSocialImage', () => {
  beforeEach(() => {
    jest.mocked(ImageResponse).mockClear();
  });

  it('serves a PNG of the collage card with the intro headline, a JPEG portrait, and both font weights', async () => {
    jest.mocked(fetchIntroContent).mockResolvedValue(intro);
    const { card, options, response } = await renderCard();

    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    expect(card.props).toMatchObject({
      headline: 'Hey friends!',
      name: SITE_NAME,
      portraitUrl: 'https://images.ctfassets.net/dylan.png?fm=jpg&w=640&h=840&fit=fill',
      tagline: HOMEPAGE_TITLE,
    });
    expect(card.props.grainUrl).toMatch(/^data:image\/png;base64,/);
    expect(options).toMatchObject({ height: 630, width: 1200 });
    expect(options.fonts?.map(({ name, weight }) => ({ name, weight }))).toEqual([
      { name: 'Familjen Grotesk', weight: 400 },
      { name: 'Familjen Grotesk', weight: 700 },
    ]);
    for (const font of options.fonts ?? []) {
      expect(font.data instanceof ArrayBuffer && new DataView(font.data).getUint32(0)).toBe(
        TRUETYPE_SFNT_VERSION,
      );
    }
  });

  it('falls back to the site name without a portrait when Contentful has no intro', async () => {
    jest.mocked(fetchIntroContent).mockResolvedValue(null);
    const { card } = await renderCard();

    expect(card.props).toMatchObject({ headline: SITE_NAME, portraitUrl: null });
  });
});
