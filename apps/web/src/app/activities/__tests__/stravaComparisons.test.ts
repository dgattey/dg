import { distanceComparison, everestComparison, movingTimeComparison } from '../stravaComparisons';

const MILE = 1609.344;
const DAY = 86_400;

describe('distanceComparison', () => {
  it.each([
    [20_412, '0.8×', 'around Earth'],
    [62_000, '2.5×', 'around Earth'],
    [8_000, '2.9×', 'across the US'],
    [1_000, '2.6×', 'SF to LA'],
    [250, '1.3×', 'SF to Tahoe'],
    [107, '4.1', 'marathons'],
    [26.2, '1', 'marathon'],
    [10, '5.9×', 'across the Golden Gate'],
    [0.85, '0.5×', 'across the Golden Gate'],
  ])('reads %d miles as %s %s', (miles, figure, unit) => {
    expect(distanceComparison(miles * MILE)).toEqual({ figure, unit });
  });
});

describe('everestComparison', () => {
  it.each([
    [0, '0%', 'of an Everest'],
    [2_655, '30%', 'of an Everest'],
    [8_849, '1', 'Everest climbed'],
    [12_389, '1.4', 'Everests climbed'],
    [500_000, '57', 'Everests climbed'],
  ])('reads %d meters as %s %s', (meters, figure, unit) => {
    expect(everestComparison(meters)).toEqual({ figure, unit });
  });
});

describe('movingTimeComparison', () => {
  it('counts days in the saddle for rides and on the move for anything else', () => {
    expect(movingTimeComparison(1_512 * 3600, 'ride')).toEqual({
      figure: '63',
      unit: 'days in the saddle',
    });
    expect(movingTimeComparison(DAY, 'run')).toEqual({ figure: '1', unit: 'day on the move' });
    expect(movingTimeComparison(6 * 3600, 'all')).toEqual({
      figure: '25%',
      unit: 'of a day on the move',
    });
  });
});
