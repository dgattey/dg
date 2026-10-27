import 'server-only';

import { log } from '@dg/shared-core/logging/log';

/**
 * Asks the deployed site to re-sync Spotify and drop its music caches, so a
 * local script's database writes show up without waiting for cache expiry.
 * Does nothing without `CRON_SECRET`.
 */
export async function revalidateRemoteSpotify(reason: string): Promise<void> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return;
  }
  const siteOrigin = process.env.SITE_URL?.trim() || 'https://dylangattey.com';
  try {
    const syncResponse = await fetch(
      `${siteOrigin.replace(/\/$/, '')}/api/spotify/sync?force=true`,
      {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${cronSecret}` },
      },
    );
    log.info(`Triggered remote Spotify cache revalidation after ${reason}`, {
      status: syncResponse.status,
    });
  } catch (error) {
    log.warn(`Could not trigger remote Spotify cache revalidation after ${reason}`, { error });
  }
}
