import { PROJECT_IMAGE_SIZES } from '../../helpers/imageSizes';
import { generateSizesString } from '../Image';

describe('generateSizesString', () => {
  it('puts media conditions narrowest first and the fallback last, whatever the key order', () => {
    expect(
      generateSizesString({ extraLarge: 392, large: 392, medium: 300, small: 300, tiny: 280 }),
    ).toBe(
      '(max-width: 576px) 280px, (max-width: 768px) 300px, (max-width: 992px) 300px, (max-width: 1200px) 392px, 392px',
    );
  });

  it('orders extraTiny ahead of tiny', () => {
    expect(generateSizesString(PROJECT_IMAGE_SIZES)).toBe(
      '(max-width: 340px) 340px, (max-width: 576px) 543px, (max-width: 768px) 510px, (max-width: 992px) 297px, (max-width: 1200px) 313.5px, 330px',
    );
  });

  it('emits just the fallback when only extraLarge is given', () => {
    expect(generateSizesString({ extraLarge: 220 })).toBe('220px');
  });
});
