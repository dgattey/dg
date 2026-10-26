import imageLoader from '../imageLoader';

describe('imageLoader', () => {
  it('rewrites Contentful raster images to Contentful Images API AVIF URLs and preserves existing query params', () => {
    expect(
      imageLoader({
        src: 'https://images.ctfassets.net/space/asset/hash/photo.png',
        width: 640,
      }),
    ).toBe('https://images.ctfassets.net/space/asset/hash/photo.png?w=640&q=75&fm=avif');

    expect(
      imageLoader({
        quality: 60,
        src: 'https://images.ctfassets.net/space/asset/hash/photo.webp?w=1520&fit=fill',
        width: 380,
      }),
    ).toBe('https://images.ctfassets.net/space/asset/hash/photo.webp?w=380&fit=fill&q=60&fm=avif');
  });

  it('leaves Contentful SVG assets unchanged', () => {
    const svgUrl = 'https://images.ctfassets.net/space/asset/hash/logo.svg';
    expect(imageLoader({ quality: 75, src: svgUrl, width: 640 })).toBe(svgUrl);
  });

  it('maps Spotify i.scdn.co album art to 64px, 300px, and 640px CDN size tiers', () => {
    const hash = '2b497f6bf340faa8812b940c';
    const fullUrl = `https://i.scdn.co/image/ab67616d0000b273${hash}`;

    expect(imageLoader({ src: fullUrl, width: 28 })).toBe(
      `https://i.scdn.co/image/ab67616d00004851${hash}`,
    );
    expect(imageLoader({ src: fullUrl, width: 64 })).toBe(
      `https://i.scdn.co/image/ab67616d00004851${hash}`,
    );
    expect(imageLoader({ src: fullUrl, width: 96 })).toBe(
      `https://i.scdn.co/image/ab67616d00001e02${hash}`,
    );
    expect(imageLoader({ src: fullUrl, width: 300 })).toBe(
      `https://i.scdn.co/image/ab67616d00001e02${hash}`,
    );
    expect(imageLoader({ src: fullUrl, width: 440 })).toBe(fullUrl);
    expect(imageLoader({ src: fullUrl, width: 640 })).toBe(fullUrl);

    const nonAlbumUrl = 'https://i.scdn.co/image/still-blessed';
    expect(imageLoader({ src: nonAlbumUrl, width: 200 })).toBe(nonAlbumUrl);
  });

  it('maps Spotify mosaic.scdn.co playlist covers to 60px, 300px, and 640px tiers', () => {
    const mosaicHash = 'ab67616d00001e020672b0f8756ae2af86e8a5ce';
    const mosaicUrl = `https://mosaic.scdn.co/640/${mosaicHash}`;

    expect(imageLoader({ src: mosaicUrl, width: 64 })).toBe(
      `https://mosaic.scdn.co/60/${mosaicHash}`,
    );
    expect(imageLoader({ src: mosaicUrl, width: 200 })).toBe(
      `https://mosaic.scdn.co/300/${mosaicHash}`,
    );
    expect(imageLoader({ src: mosaicUrl, width: 640 })).toBe(mosaicUrl);
  });

  it('handles local relative paths, local SVGs, data URLs, and other external hosts', () => {
    expect(imageLoader({ src: '/img/grain.png', width: 200 })).toBe('/img/grain.png?w=200');
    expect(imageLoader({ src: '/img/grain.png?v=2', width: 300 })).toBe('/img/grain.png?v=2&w=300');
    expect(imageLoader({ src: '/img/mark.svg', width: 64 })).toBe('/img/mark.svg');

    const dataUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
    expect(imageLoader({ src: dataUrl, width: 64 })).toBe(dataUrl);

    const externalIcon = 'https://scone.gattey.com/icon.png';
    expect(imageLoader({ src: externalIcon, width: 44 })).toBe(externalIcon);
  });
});
