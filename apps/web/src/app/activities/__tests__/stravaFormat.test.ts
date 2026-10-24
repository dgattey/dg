import { formatHours } from '../stravaFormat';

describe('formatHours', () => {
  it.each([
    [0, '0 hrs'],
    [3_000, '1 hr'],
    [4_622_400, '1,284 hrs'],
  ])('reads %d seconds as %s', (seconds, expected) => {
    expect(formatHours(seconds)).toBe(expected);
  });
});
