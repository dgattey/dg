import { log } from '@dg/shared-core/logging/log';

type Env = {
  CRON_SECRET?: string;
  SITE_URL: string;
};

const SYNC_TIMEOUT_MS = 60_000;

/** Calls the site's Spotify sync route the same way the old GitHub Actions cron did. */
export async function triggerSpotifySync(env: Env): Promise<void> {
  if (!env.CRON_SECRET) {
    log.error('Spotify sync skipped: CRON_SECRET is not set');
    return;
  }

  try {
    const response = await fetch(`${env.SITE_URL}/api/spotify/sync`, {
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
      method: 'GET',
      signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
    });
    const body = await response.text();

    if (response.status !== 200) {
      log.error('Spotify sync failed', { body, status: response.status });
    } else if (body.includes('"gapDetected":true')) {
      log.warn('Spotify returned a full 50-track window; plays between runs may have been lost');
    }
  } catch (error) {
    log.error('Spotify sync request failed', { error });
  }
}

export default {
  async scheduled(_controller, env) {
    await triggerSpotifySync(env);
  },
} satisfies ExportedHandler<Env>;
