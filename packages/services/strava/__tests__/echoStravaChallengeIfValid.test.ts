import { log } from '@dg/shared-core/logging/log';
import { mockEnv } from '@dg/testing/mocks';
import { echoStravaChallengeIfValid } from '../echoStravaChallengeIfValid';

describe('echoStravaChallengeIfValid', () => {
  beforeEach(() => {
    jest.spyOn(log, 'info').mockImplementation(() => undefined);
    mockEnv({ STRAVA_VERIFY_TOKEN: 'secret-strava-verify-token' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the challenge when mode and verify token match', () => {
    const query = new URLSearchParams({
      'hub.challenge': 'challenge-123',
      'hub.mode': 'subscribe',
      'hub.verify_token': 'secret-strava-verify-token',
    });

    expect(echoStravaChallengeIfValid(query)).toEqual({
      'hub.challenge': 'challenge-123',
    });
  });

  it('fails closed when STRAVA_VERIFY_TOKEN is unset and verify_token is omitted', () => {
    mockEnv({ STRAVA_VERIFY_TOKEN: undefined });
    const query = new URLSearchParams({
      'hub.challenge': 'challenge-123',
      'hub.mode': 'subscribe',
    });

    expect(echoStravaChallengeIfValid(query)).toBeNull();
  });

  it('returns null and does not log expected token on mismatch', () => {
    const query = new URLSearchParams({
      'hub.challenge': 'challenge-123',
      'hub.mode': 'subscribe',
      'hub.verify_token': 'wrong-token',
    });

    expect(echoStravaChallengeIfValid(query)).toBeNull();
    expect(log.info).toHaveBeenCalledWith(
      'Strava challenge validation details',
      expect.not.objectContaining({
        tokenExpected: expect.anything(),
      }),
    );
  });
});
