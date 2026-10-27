import 'server-only';

import { db, Op } from '@dg/db';
import { MusicArtist } from '@dg/db/models/MusicArtist';
import { MusicTrack } from '@dg/db/models/MusicTrack';
import { log } from '@dg/shared-core/logging/log';
import {
  normalizeTrackLookupKey,
  type ParsedHistoryPlay,
  type ParsedStreamingHistory,
  type ParseHistoryFilterOptions,
  parseExtendedStreamingHistory,
} from './parseSpotifyHistoryExport';
import { insertSpotifyPlayBatch } from './syncSpotifyHistory';
import { cacheTrackData, resolveTrackDisplays } from './trackDisplays';
import { mapInBatches, type TrackMetadata } from './trackMetadataShared';
import { searchTrackDisplayData, type TrackDisplayData } from './trackMetadataSingle';
import { captureTrackPopularity } from './trackPopularity';

/**
 * Spotify's Extended Streaming History export records `ts` in whole seconds,
 * 1 to 3 seconds before the `recently-played` Web API's millisecond `played_at`.
 * Matching any non-zero-millisecond API row for the same track within ±10s
 * prevents duplicate inserts when an export overlaps cron-synced periods.
 */
const API_TIMESTAMP_SKEW_MS = 10_000;
const MINUTE_TIMESTAMP_SKEW_MS = 60_000;
const INSERT_BATCH_SIZE = 2_000;
const METADATA_LOOKUP_BATCH_SIZE = 1_000;

export type ImportSpotifyHistoryOptions = ParseHistoryFilterOptions & { dryRun?: boolean };
export type SpotifyHistoryImportResult = {
  alreadyInDb: number;
  failedTrackIds: Array<string>;
  imported: number;
  musicEntries: number;
  skippedNonMusic: number;
  skippedOutOfRange: number;
  skippedShortPlays: number;
  totalEntries: number;
};

type ResolvedHistoryPlay = {
  msPlayed: number;
  playedAt: Date;
  precision: 'minute' | 'second';
  trackId: string;
};

async function resolveBasicHistoryTrackIds(
  entries: ReadonlyArray<ParsedHistoryPlay>,
  knownTrackIdsByName: ReadonlyMap<string, string>,
): Promise<{
  failedNames: Array<string>;
  resolvedEntries: Array<ResolvedHistoryPlay>;
}> {
  const byName = new Map(knownTrackIdsByName);
  const missingPairs = new Map<string, { artistName: string; trackName: string }>();

  for (const entry of entries) {
    if (entry.trackId || !entry.trackName || !entry.artistName) {
      continue;
    }
    const key = normalizeTrackLookupKey(entry.trackName, entry.artistName);
    if (!byName.has(key)) {
      missingPairs.set(key, { artistName: entry.artistName, trackName: entry.trackName });
    }
  }

  if (missingPairs.size > 0) {
    const candidateNames = [...new Set([...missingPairs.values()].map((p) => p.trackName))];
    const cachedTracks = await MusicTrack.findAll({
      include: [{ model: MusicArtist, through: { attributes: [] } }],
      where: { name: { [Op.in]: candidateNames } },
    });
    for (const track of cachedTracks) {
      for (const artist of track.artists ?? []) {
        const key = normalizeTrackLookupKey(track.name, artist.name);
        if (missingPairs.has(key) && !byName.has(key)) {
          byName.set(key, track.id);
        }
      }
    }

    const stillMissing = [...missingPairs.entries()].filter(([key]) => !byName.has(key));
    const searched = await mapInBatches(stillMissing, async ([key, pair]) => {
      const data = await searchTrackDisplayData(pair.trackName, pair.artistName);
      return data ? { data, key } : null;
    });
    const searchedDisplays: Array<TrackDisplayData> = [];
    for (const { data, key } of searched) {
      byName.set(key, data.track.id);
      searchedDisplays.push(data);
    }
    await cacheTrackData(searchedDisplays);
  }

  const failedNames = new Set<string>();
  const resolvedEntries: Array<ResolvedHistoryPlay> = [];
  for (const entry of entries) {
    const lookupKey =
      entry.trackName && entry.artistName
        ? normalizeTrackLookupKey(entry.trackName, entry.artistName)
        : undefined;
    const trackId = entry.trackId ?? (lookupKey ? byName.get(lookupKey) : undefined);
    if (!trackId) {
      failedNames.add(`${entry.artistName ?? 'Unknown'} - ${entry.trackName ?? 'Unknown'}`);
      continue;
    }
    resolvedEntries.push({
      msPlayed: entry.msPlayed,
      playedAt: entry.playedAt,
      precision: entry.precision,
      trackId,
    });
  }

  return { failedNames: [...failedNames], resolvedEntries };
}

async function filterOutExistingPlays(
  entries: ReadonlyArray<ResolvedHistoryPlay>,
): Promise<Array<ResolvedHistoryPlay>> {
  const firstEntry = entries[0];
  const lastEntry = entries[entries.length - 1];
  if (!firstEntry || !lastEntry) {
    return [];
  }

  const minTime = new Date(firstEntry.playedAt.getTime() - MINUTE_TIMESTAMP_SKEW_MS);
  const maxTime = new Date(lastEntry.playedAt.getTime() + MINUTE_TIMESTAMP_SKEW_MS);
  const uniqueTrackIds = [...new Set(entries.map((entry) => entry.trackId))];

  const existingByTrack = new Map<string, Array<number>>();
  for (let i = 0; i < uniqueTrackIds.length; i += METADATA_LOOKUP_BATCH_SIZE) {
    const rows = await db.SpotifyPlay.findAll({
      attributes: ['playedAt', 'trackId'],
      where: {
        playedAt: { [Op.between]: [minTime, maxTime] },
        trackId: { [Op.in]: uniqueTrackIds.slice(i, i + METADATA_LOOKUP_BATCH_SIZE) },
      },
    });
    for (const row of rows) {
      const list = existingByTrack.get(row.trackId) ?? [];
      list.push(row.playedAt.getTime());
      existingByTrack.set(row.trackId, list);
    }
  }

  return entries.filter((entry) => {
    const existingTimestamps = existingByTrack.get(entry.trackId);
    if (!existingTimestamps) {
      return true;
    }
    const candidateMs = entry.playedAt.getTime();
    if (entry.precision === 'minute') {
      return !existingTimestamps.some(
        (existingMs) => Math.abs(existingMs - candidateMs) <= MINUTE_TIMESTAMP_SKEW_MS,
      );
    }
    return !existingTimestamps.some(
      (existingMs) =>
        existingMs === candidateMs ||
        (existingMs % 1000 !== 0 && Math.abs(existingMs - candidateMs) <= API_TIMESTAMP_SKEW_MS),
    );
  });
}

async function resolveTrackMetadata(
  trackIds: ReadonlyArray<string>,
): Promise<Map<string, TrackMetadata>> {
  const metadata = new Map<string, TrackMetadata>();
  for (let i = 0; i < trackIds.length; i += METADATA_LOOKUP_BATCH_SIZE) {
    const batch = trackIds.slice(i, i + METADATA_LOOKUP_BATCH_SIZE);
    const rows = await db.SpotifyPlay.findAll({
      attributes: ['trackId', 'albumId', 'artistIds'],
      group: ['trackId', 'albumId', 'artistIds'],
      where: { trackId: { [Op.in]: batch } },
    });
    for (const row of rows) {
      metadata.set(row.trackId, { albumId: row.albumId, artistIds: row.artistIds });
    }
  }

  const missingAfterPlayTable = trackIds.filter((id) => !metadata.has(id));
  if (missingAfterPlayTable.length > 0) {
    const displays = await resolveTrackDisplays(missingAfterPlayTable);
    for (const [id, display] of displays) {
      metadata.set(id, {
        albumId: display.album.id,
        artistIds: display.artists.map((artist) => artist.id),
      });
    }
  }
  return metadata;
}

export async function importSpotifyHistoryEntries(
  parsedHistory: ParsedStreamingHistory,
  options: Pick<ImportSpotifyHistoryOptions, 'dryRun'> = {},
): Promise<SpotifyHistoryImportResult> {
  const { dryRun = false } = options;
  const {
    entries,
    knownTrackIdsByName,
    skippedNonMusic,
    skippedOutOfRange,
    skippedShortPlays,
    totalEntries,
  } = parsedHistory;
  const baseCounts = {
    musicEntries: entries.length,
    skippedNonMusic,
    skippedOutOfRange,
    skippedShortPlays,
    totalEntries,
  };

  if (dryRun || entries.length === 0) {
    return {
      ...baseCounts,
      alreadyInDb: 0,
      failedTrackIds: [],
      imported: dryRun ? entries.length : 0,
    };
  }

  const { failedNames, resolvedEntries } = await resolveBasicHistoryTrackIds(
    entries,
    knownTrackIdsByName,
  );
  const pendingEntries = await filterOutExistingPlays(resolvedEntries);
  if (pendingEntries.length === 0) {
    const alreadyInDb = resolvedEntries.length;
    log.info('All Spotify history entries already exist in database', { alreadyInDb });
    return { ...baseCounts, alreadyInDb, failedTrackIds: failedNames, imported: 0 };
  }

  const uniqueTrackIds = [...new Set(pendingEntries.map((entry) => entry.trackId))];
  const allMetadata = await resolveTrackMetadata(uniqueTrackIds);

  const failedTrackIds = new Set<string>(failedNames);
  const rowsToInsert = pendingEntries.flatMap((entry) => {
    const meta = allMetadata.get(entry.trackId);
    if (!meta) {
      failedTrackIds.add(entry.trackId);
      return [];
    }
    return [
      {
        albumId: meta.albumId,
        artistIds: meta.artistIds,
        playedAt: entry.playedAt,
        trackId: entry.trackId,
      },
    ];
  });

  let imported = 0;
  for (let i = 0; i < rowsToInsert.length; i += INSERT_BATCH_SIZE) {
    imported += await insertSpotifyPlayBatch(rowsToInsert.slice(i, i + INSERT_BATCH_SIZE));
  }

  const popularity = await captureTrackPopularity(rowsToInsert.map((row) => row.trackId));

  const failedIds = [...failedTrackIds];
  const alreadyInDb = Math.max(0, entries.length - failedIds.length - imported);
  log.info('Spotify Extended Streaming History import complete', {
    alreadyInDb,
    failedTracks: failedIds.length,
    imported,
    musicEntries: entries.length,
    popularity,
  });

  return { ...baseCounts, alreadyInDb, failedTrackIds: failedIds, imported };
}

export async function importSpotifyHistory(
  fileText: string,
  options: ImportSpotifyHistoryOptions = {},
): Promise<SpotifyHistoryImportResult> {
  const parsed = parseExtendedStreamingHistory(fileText, options);
  return await importSpotifyHistoryEntries(parsed, options);
}
