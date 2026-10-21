import { getTypography } from '../typography';

describe('getTypography', () => {
  it('returns the bumped shared label and meta sizes for button, overline, and caption', () => {
    const typography = getTypography();

    expect(typography.button).toEqual({
      fontSize: 'clamp(18px, 1.6vw, 20px)',
      fontWeight: 600,
    });
    expect(typography.overline).toEqual({
      fontSize: 16,
      fontWeight: 600,
    });
    expect(typography.caption).toEqual({
      fontSize: 15,
      fontStretch: 'semi-expanded',
      fontWeight: 500,
    });
  });
});
