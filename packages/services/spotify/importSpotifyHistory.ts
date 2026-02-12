import 'server-only';

import { db } from '@dg/db';
import { log } from '@dg/shared-core/logging/log';
import * as v from 'valibot';
import { fetchAllTrackMetadataBatch } from './trackMetadataBatch';
import { extractTrackId, getExistingTrackMetadata } from './trackMetadataShared';

/**
 * Schema for Spotify GDPR Extended StreamingHistory JSON entries.
 */
const extendedStreamingHistorySchema = v.array(
  v.object({
    ms_played: v.number(),
    spotify_track_uri: v.nullable(v.string()),
    ts: v.string(),
  }),
);

export type ImportResult = {
  imported: number;
  skipped: number;
  errors: number;
  failedTrackIds: Array<string>;
};

/**
 * Imports Spotify listening history from a GDPR Extended StreamingHistory export.
 */
export async function importSpotifyHistory(
  fileText: string,
  options: { dryRun?: boolean } = {},
): Promise<ImportResult> {
  const { dryRun = false } = options;
  const parsed = v.parse(extendedStreamingHistorySchema, JSON.parse(fileText));

  const musicEntries = parsed.filter((entry) => entry.spotify_track_uri !== null);
  const skipped = parsed.length - musicEntries.length;

  log.info('Starting Spotify history import', {
    dryRun,
    musicEntries: musicEntries.length,
    skipped,
    totalEntries: parsed.length,
  });

  if (dryRun) {
    log.info('Dry run complete', { skipped, wouldImport: musicEntries.length });
    return { errors: 0, failedTrackIds: [], imported: musicEntries.length, skipped };
  }

  // Resolve track metadata: DB first, then Spotify API for the rest
  const uniqueTrackIds = [
    ...new Set(musicEntries.map((entry) => extractTrackId(entry.spotify_track_uri as string))),
  ];
  const existingMetadata = await getExistingTrackMetadata(uniqueTrackIds);
  const newTrackIds = uniqueTrackIds.filter((id) => !existingMetadata.has(id));

  log.info('Metadata lookup', {
    existingInDb: existingMetadata.size,
    needApiFetch: newTrackIds.length,
  });

  const { batchErrors, metadata: fetchedMetadata } = await fetchAllTrackMetadataBatch(newTrackIds);
  const allMetadata = new Map([...existingMetadata, ...fetchedMetadata]);

  // Build DB rows, collecting any tracks we couldn't resolve
  const failedTrackIds = new Set<string>();
  const rows = musicEntries.flatMap((entry) => {
    const trackId = extractTrackId(entry.spotify_track_uri as string);
    const meta = allMetadata.get(trackId);
    if (!meta) {
      failedTrackIds.add(trackId);
      return [];
    }
    return [
      { albumId: meta.albumId, artistIds: meta.artistIds, playedAt: new Date(entry.ts), trackId },
    ];
  });

  // Insert rows
  let imported = 0;
  if (rows.length > 0) {
    const countBefore = await db.SpotifyPlay.count();
    await db.SpotifyPlay.bulkCreate(rows, { ignoreDuplicates: true });
    imported = (await db.SpotifyPlay.count()) - countBefore;
  }

  const failedIds = [...failedTrackIds];
  log.info('=== CHUNK IMPORT COMPLETE ===', {
    errors: failedIds.length,
    imported,
    skipped,
    ...(batchErrors.length > 0 && { batchErrors }),
    ...(failedIds.length > 0 && { failedTrackIds: failedIds }),
  });

  return { errors: failedIds.length, failedTrackIds: failedIds, imported, skipped };
}
