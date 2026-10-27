import { MAX_PAUSE_MS, popularityPauseMs } from '../popularityBackoff';

const MINUTE = 60_000;

describe('popularityPauseMs', () => {
  it('honors Retry-After but never pauses less than a minute', () => {
    expect(popularityPauseMs({ retryAfterSeconds: 0, status: 429 }, 1)).toBe(MINUTE);
    expect(popularityPauseMs({ retryAfterSeconds: 7200, status: 429 }, 1)).toBe(2 * 60 * MINUTE);
  });

  it('doubles with each failure, jittered between half and all of the ceiling, up to six hours', () => {
    const low = () => 0;
    const high = () => 1;
    expect(
      [1, 2, 3, 4].map((failures) => popularityPauseMs({ status: 503 }, failures, high)),
    ).toEqual([15, 30, 60, 120].map((minutes) => minutes * MINUTE));
    expect(popularityPauseMs({ status: 503 }, 1, low)).toBe(7.5 * MINUTE);
    expect(popularityPauseMs({}, 2, () => 0.5)).toBe(22.5 * MINUTE);
    expect(popularityPauseMs({ status: 500 }, 12, high)).toBe(MAX_PAUSE_MS);
    expect(popularityPauseMs({ status: 500 }, 12, low)).toBe(MAX_PAUSE_MS / 2);
  });

  it('waits the longest pause on refusals that retrying cannot fix', () => {
    expect(popularityPauseMs({ status: 403 }, 1)).toBe(MAX_PAUSE_MS);
  });
});
