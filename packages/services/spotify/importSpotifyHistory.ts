import 'server-only';

import { db, Op } from '@dg/db';
import { MusicAlbum } from '@dg/db/models/MusicAlbum';
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
import { cacheTrackData } from './trackDisplays';
import { sleep, type TrackMetadata } from './trackMetadataShared';
import {
  fetchTrackDisplayData,
  searchTrackDisplayData,
  type TrackDisplayData,
} from './trackMetadataSingle';

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
const FETCH_CONCURRENCY = 5;
const FETCH_THROTTLE_MS = 100;

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
    const searchedDisplays: Array<TrackDisplayData> = [];
    for (let i = 0; i < stillMissing.length; i += FETCH_CONCURRENCY) {
      const batch = stillMissing.slice(i, i + FETCH_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(async ([key, pair]) => ({
          data: await searchTrackDisplayData(pair.trackName, pair.artistName),
          key,
        })),
      );
      for (const res of results) {
        if (res.status === 'fulfilled' && res.value.data) {
          byName.set(res.value.key, res.value.data.track.id);
          searchedDisplays.push(res.value.data);
        }
      }
      if (i + FETCH_CONCURRENCY < stillMissing.length) {
        await sleep(FETCH_THROTTLE_MS);
      }
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
    const cachedTracks = await MusicTrack.findAll({
      include: [MusicAlbum, { model: MusicArtist, through: { attributes: ['position'] } }],
      where: { id: { [Op.in]: missingAfterPlayTable } },
    });
    for (const track of cachedTracks) {
      const artists = track.artists ?? [];
      if (track.albumId && artists.length > 0) {
        metadata.set(track.id, {
          albumId: track.albumId,
          artistIds: artists.map((artist) => artist.id),
        });
      }
    }
  }

  const missingIds = trackIds.filter((id) => !metadata.has(id));
  const fetchedDisplays: Array<TrackDisplayData> = [];
  for (let i = 0; i < missingIds.length; i += FETCH_CONCURRENCY) {
    const batch = missingIds.slice(i, i + FETCH_CONCURRENCY);
    const results = await Promise.allSettled(
      batch.map(async (trackId) => ({
        data: await fetchTrackDisplayData(trackId),
        requestedId: trackId,
      })),
    );
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.data) {
        const { data, requestedId } = result.value;
        fetchedDisplays.push(data);
        metadata.set(requestedId, {
          albumId: data.album.id,
          artistIds: data.artists.map((artist) => artist.id),
        });
      }
    }
    if (i + FETCH_CONCURRENCY < missingIds.length) {
      await sleep(FETCH_THROTTLE_MS);
    }
  }

  await cacheTrackData(fetchedDisplays);
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
    const batch = rowsToInsert.slice(i, i + INSERT_BATCH_SIZE);
    const batchKeys = { [Op.or]: batch.map(({ playedAt, trackId }) => ({ playedAt, trackId })) };
    const beforeCount = await db.SpotifyPlay.count({ where: batchKeys });
    await db.SpotifyPlay.bulkCreate(batch, { ignoreDuplicates: true });
    const afterCount = await db.SpotifyPlay.count({ where: batchKeys });
    imported += afterCount - beforeCount;
  }

  const failedIds = [...failedTrackIds];
  const alreadyInDb = Math.max(0, entries.length - failedIds.length - imported);
  log.info('Spotify Extended Streaming History import complete', {
    alreadyInDb,
    failedTracks: failedIds.length,
    imported,
    musicEntries: entries.length,
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
