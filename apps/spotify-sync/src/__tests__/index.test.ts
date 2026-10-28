import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { log } from '@dg/shared-core/logging/log';
import { triggerSpotifySync } from '../index';

const env = { CRON_SECRET: 'test-secret', SITE_URL: 'https://example.com' };

describe('triggerSpotifySync', () => {
  let errorLog: ReturnType<typeof mock.method>;
  let warnLog: ReturnType<typeof mock.method>;

  beforeEach(() => {
    errorLog = mock.method(log, 'error', () => {});
    warnLog = mock.method(log, 'warn', () => {});
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('sends the cron secret as a Bearer token to the sync route', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', () =>
      Promise.resolve(Response.json({ gapDetected: false, success: true })),
    );

    await triggerSpotifySync(env);

    assert.equal(fetchMock.mock.callCount(), 1);
    const [url, init] = fetchMock.mock.calls[0]?.arguments ?? [];
    assert.equal(url, 'https://example.com/api/spotify/sync');
    assert.equal(init?.method, 'GET');
    assert.deepEqual(init?.headers, { Authorization: 'Bearer test-secret' });
    assert.equal(errorLog.mock.callCount(), 0);
    assert.equal(warnLog.mock.callCount(), 0);
  });

  it('logs non-200 responses', async () => {
    mock.method(globalThis, 'fetch', () =>
      Promise.resolve(Response.json({ error: 'Unauthorized' }, { status: 401 })),
    );

    await triggerSpotifySync(env);

    assert.equal(errorLog.mock.callCount(), 1);
    assert.deepEqual(errorLog.mock.calls[0]?.arguments, [
      'Spotify sync failed',
      { body: '{"error":"Unauthorized"}', status: 401 },
    ]);
  });

  it('logs network errors without throwing', async () => {
    mock.method(globalThis, 'fetch', () => Promise.reject(new TypeError('fetch failed')));

    await triggerSpotifySync(env);

    assert.equal(errorLog.mock.callCount(), 1);
    assert.equal(errorLog.mock.calls[0]?.arguments[0], 'Spotify sync request failed');
  });

  it('warns when Spotify returned a full window', async () => {
    mock.method(globalThis, 'fetch', () =>
      Promise.resolve(Response.json({ gapDetected: true, success: true })),
    );

    await triggerSpotifySync(env);

    assert.equal(warnLog.mock.callCount(), 1);
    assert.equal(errorLog.mock.callCount(), 0);
  });

  it('skips the request when CRON_SECRET is missing', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', () => Promise.resolve(Response.json({})));

    await triggerSpotifySync({ SITE_URL: env.SITE_URL });

    assert.equal(fetchMock.mock.callCount(), 0);
    assert.equal(errorLog.mock.callCount(), 1);
  });
});
