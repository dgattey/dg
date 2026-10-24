import { formatEverests, formatHours } from '../stravaFormat';

describe('formatEverests', () => {
  it.each([
    [0, '≈ 0% of Everest'],
    [2_655, '≈ 30% of Everest'],
    [8_849, '≈ 1 Everest'],
    [12_389, '≈ 1.4 Everests'],
    [500_000, '≈ 57 Everests'],
  ])('reads %d meters as %s', (meters, expected) => {
    expect(formatEverests(meters)).toBe(expected);
  });
});

describe('formatHours', () => {
  it.each([
    [0, '0 hrs'],
    [3_000, '1 hr'],
    [4_622_400, '1,284 hrs'],
  ])('reads %d seconds as %s', (seconds, expected) => {
    expect(formatHours(seconds)).toBe(expected);
  });
});
