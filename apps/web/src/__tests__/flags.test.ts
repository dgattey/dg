/**
 * @jest-environment node
 */

import { mockEnv } from '@dg/testing/mocks';
import type { ReadonlyHeaders, ReadonlyRequestCookies } from 'flags';
import type * as Flags from '../flags';

type FlagsModule = typeof Flags;

const mockVercelAdapter = jest.fn();

jest.mock('@flags-sdk/vercel', () => ({
  vercelAdapter: () => mockVercelAdapter(),
}));

jest.mock('flags/next', () => ({
  dedupe: <T>(fn: T) => fn,
  flag: <T>(definition: T) => definition,
}));

const cookies = {} as ReadonlyRequestCookies;
const headers = {} as ReadonlyHeaders;

function loadFlags(): FlagsModule {
  let flags: FlagsModule | undefined;
  jest.isolateModules(() => {
    flags = jest.requireActual<FlagsModule>('../flags');
  });
  if (!flags) {
    throw new Error('Expected flags module to load');
  }
  return flags;
}

function decide(flags: FlagsModule, entities = {}) {
  const definition = flags.interactiveRedesign as unknown as {
    decide: (params: {
      cookies: ReadonlyRequestCookies;
      entities: object;
      headers: ReadonlyHeaders;
    }) => boolean | Promise<boolean>;
  };
  return Promise.resolve(definition.decide({ cookies, entities, headers }));
}

describe('interactiveRedesign', () => {
  const adapterDecide = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    adapterDecide.mockReset().mockResolvedValue(true);
    mockVercelAdapter.mockReset().mockReturnValue({ decide: adapterDecide, origin: 'vercel' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(['preview', 'development', undefined])(
    'never reads Vercel Flags when VERCEL_ENV is %s',
    async (vercelEnv) => {
      mockEnv({ VERCEL_ENV: vercelEnv });
      const flags = loadFlags();

      await expect(decide(flags)).resolves.toBe(false);
      expect(adapterDecide).not.toHaveBeenCalled();
    },
  );

  it('reuses a production decision for the same entities until it expires', async () => {
    mockEnv({ VERCEL_ENV: 'production' });
    const flags = loadFlags();

    await expect(decide(flags)).resolves.toBe(true);
    await expect(decide(flags)).resolves.toBe(true);
    expect(adapterDecide).toHaveBeenCalledTimes(1);

    await decide(flags, { user: { email: 'hi@dylangattey.com', id: 'user_1' } });
    expect(adapterDecide).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(60_001);
    await decide(flags);
    expect(adapterDecide).toHaveBeenCalledTimes(3);
  });

  it('does not cache a failed production decision', async () => {
    mockEnv({ VERCEL_ENV: 'production' });
    adapterDecide.mockRejectedValueOnce(new Error('datafile unavailable'));
    const flags = loadFlags();

    await expect(decide(flags)).rejects.toThrow('datafile unavailable');
    await expect(decide(flags)).resolves.toBe(true);
    expect(adapterDecide).toHaveBeenCalledTimes(2);
  });

  it('falls back to the default instead of throwing when FLAGS is invalid', async () => {
    mockEnv({ VERCEL_ENV: 'production' });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockVercelAdapter.mockImplementation(() => {
      throw new Error('@vercel/flags-core: Missing sdkKey');
    });

    const flags = loadFlags();

    await expect(decide(flags)).resolves.toBe(false);
    expect(consoleError).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
