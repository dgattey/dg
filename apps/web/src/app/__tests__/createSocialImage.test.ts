jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
}));

// @vercel/og ships ESM with `import.meta`, which this Jest setup cannot load.
jest.mock('@dg/og/generateOpenGraphImage', () => ({
  generateOpenGraphImage: jest.fn(() => new Response(new Uint8Array([0x89, 0x50, 0x4e, 0x47]))),
}));

import { generateOpenGraphImage } from '@dg/og/generateOpenGraphImage';
import { createSocialImage } from '../createSocialImage';

const TRUETYPE_SFNT_VERSION = 0x00010000;

describe('createSocialImage', () => {
  it('serves the rendered PNG for the given text using both brand fonts from disk', async () => {
    const response = await createSocialImage('/opengraph-image', 'Hello', 'World');

    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([0x89, 0x50, 0x4e, 0x47]);

    const [args] = jest.mocked(generateOpenGraphImage).mock.lastCall ?? [];
    if (!args) {
      throw new Error('generateOpenGraphImage was not called');
    }
    const { boldFont, normalFont, size, url } = args;
    expect(Object.fromEntries(new URL(url ?? '').searchParams)).toEqual({
      subtitle: 'World',
      text: 'Hello',
    });
    expect(size).toEqual({ height: 630, width: 1200 });
    expect(new DataView(normalFont).getUint32(0)).toBe(TRUETYPE_SFNT_VERSION);
    expect(new DataView(boldFont).getUint32(0)).toBe(TRUETYPE_SFNT_VERSION);
  });
});
