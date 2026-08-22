import { formatMovingTime } from '../formatMovingTime';

describe('formatMovingTime', () => {
  it('pads minutes on hour-long efforts', () => {
    expect(formatMovingTime(7620)).toBe('2h 07m');
  });

  it('drops the hour when the effort is under 60 minutes', () => {
    expect(formatMovingTime(420)).toBe('7m');
  });

  it('returns null when moving time is missing', () => {
    expect(formatMovingTime(undefined)).toBeNull();
    expect(formatMovingTime(null)).toBeNull();
    expect(formatMovingTime(0)).toBeNull();
  });
});
