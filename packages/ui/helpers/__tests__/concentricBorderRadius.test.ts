import { getConcentricBorderRadius } from '../concentricBorderRadius';

describe('getConcentricBorderRadius', () => {
  it('subtracts the inset from the parent radius', () => {
    expect(getConcentricBorderRadius(32, 13)).toBe('19px');
  });

  it('clamps an inset larger than the parent radius to zero', () => {
    expect(getConcentricBorderRadius(8, 12)).toBe('0px');
  });

  it('keeps a zero-radius parent square', () => {
    expect(getConcentricBorderRadius(0, 4)).toBe('0px');
  });

  it('does not let a negative inset enlarge the child radius', () => {
    expect(getConcentricBorderRadius(16, -4)).toBe('16px');
  });
});
