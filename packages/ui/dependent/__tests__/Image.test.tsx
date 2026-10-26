import { render, screen } from '@testing-library/react';
import { generateSizesString, Image } from '../Image';

describe('generateSizesString', () => {
  it('puts media conditions narrowest first and the fallback last, whatever the key order', () => {
    expect(
      generateSizesString({ extraLarge: 392, large: 392, medium: 300, small: 300, tiny: 280 }),
    ).toBe(
      '(max-width: 576px) 280px, (max-width: 768px) 300px, (max-width: 992px) 300px, (max-width: 1200px) 392px, 392px',
    );
  });

  it('orders extraTiny ahead of tiny', () => {
    expect(
      generateSizesString({
        extraLarge: 330,
        extraTiny: 340,
        large: 313.5,
        medium: 297,
        small: 510,
        tiny: 543,
      }),
    ).toBe(
      '(max-width: 340px) 340px, (max-width: 576px) 543px, (max-width: 768px) 510px, (max-width: 992px) 297px, (max-width: 1200px) 313.5px, 330px',
    );
  });

  it('emits just the fallback when only extraLarge is given', () => {
    expect(generateSizesString({ extraLarge: 220 })).toBe('220px');
  });
});

describe('Image', () => {
  it('holds the declared ratio and crops, so non-square art still fills a square slot', () => {
    render(
      <Image
        alt="Still Blessed"
        height={34}
        sizes={{ extraLarge: 34 }}
        url="https://i.scdn.co/image/still-blessed"
        width={34}
      />,
    );

    const image = screen.getByRole('img', { name: 'Still Blessed' });
    expect(image).toHaveAttribute('data-ui-image', 'aspect');
    expect(image.style.getPropertyValue('--img-aspect-ratio')).toBe('34 / 34');
    expect(image).not.toHaveAttribute('srcset');
  });

  it('emits responsive srcset for Contentful raster images and leaves SVG assets unoptimized', () => {
    const { rerender } = render(
      <Image
        alt="Cover"
        height={400}
        sizes={{ extraLarge: 400 }}
        url="https://images.ctfassets.net/space/asset/hash/cover.jpg"
        width={400}
      />,
    );

    const raster = screen.getByRole('img', { name: 'Cover' });
    expect(raster).toHaveAttribute('srcset');

    rerender(
      <Image
        alt="Cover"
        height={400}
        sizes={{ extraLarge: 400 }}
        url="https://images.ctfassets.net/space/asset/hash/logo.svg"
        width={400}
      />,
    );

    expect(screen.getByRole('img', { name: 'Cover' })).not.toHaveAttribute('srcset');
  });
});
