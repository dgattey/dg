import 'server-only';

import { inflateRawSync } from 'node:zlib';
import * as v from 'valibot';

const SPOTIFY_TRACK_URI_PREFIX = 'spotify:track:';
const SPOTIFY_ID_PATTERN = /^[0-9A-Za-z]{22}$/;
const MINUTE_DEDUP_WINDOW_MS = 60_000;

const ZIP_EOCD_SIGNATURE = 0x06054b50;
const ZIP_CD_SIGNATURE = 0x02014b50;
const ZIP_LFH_SIGNATURE = 0x04034b50;
const ZIP_METHOD_STORE = 0;
const ZIP_METHOD_DEFLATE = 8;

const extendedStreamingHistorySchema = v.array(
  v.object({
    master_metadata_album_artist_name: v.optional(v.nullable(v.string())),
    master_metadata_track_name: v.optional(v.nullable(v.string())),
    ms_played: v.number(),
    spotify_track_uri: v.nullable(v.string()),
    ts: v.string(),
  }),
);

const basicStreamingHistorySchema = v.array(
  v.object({
    artistName: v.nullable(v.string()),
    endTime: v.string(),
    msPlayed: v.number(),
    trackName: v.nullable(v.string()),
  }),
);

export type ParsedHistoryPlay = {
  artistName?: string;
  msPlayed: number;
  playedAt: Date;
  precision: 'minute' | 'second';
  trackId?: string;
  trackName?: string;
};

export type ParseHistoryFilterOptions = {
  from?: Date;
  minMsPlayed?: number;
  to?: Date;
};

export type ParsedStreamingHistory = {
  entries: Array<ParsedHistoryPlay>;
  knownTrackIdsByName: Map<string, string>;
  skippedNonMusic: number;
  skippedOutOfRange: number;
  skippedShortPlays: number;
  totalEntries: number;
};

export function normalizeTrackLookupKey(trackName: string, artistName: string): string {
  return `${trackName.trim().toLowerCase()}\u0000${artistName.trim().toLowerCase()}`;
}

export function extractSpotifyTrackId(uri: string | null | undefined): string | null {
  if (!uri?.startsWith(SPOTIFY_TRACK_URI_PREFIX)) {
    return null;
  }
  const id = uri.slice(SPOTIFY_TRACK_URI_PREFIX.length);
  return SPOTIFY_ID_PATTERN.test(id) ? id : null;
}

function parseBasicEndTime(endTime: string): Date {
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/.test(endTime)
    ? `${endTime.replace(' ', 'T')}${endTime.length === 16 ? ':00Z' : 'Z'}`
    : endTime;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp "${endTime}" in Spotify streaming history`);
  }
  return date;
}

export function parseExtendedStreamingHistory(
  fileText: string,
  options: ParseHistoryFilterOptions = {},
): ParsedStreamingHistory {
  const { from, minMsPlayed = 0, to } = options;
  const raw: unknown = JSON.parse(fileText);

  const extendedParsed = v.safeParse(extendedStreamingHistorySchema, raw);
  if (extendedParsed.success) {
    let skippedNonMusic = 0;
    let skippedShortPlays = 0;
    let skippedOutOfRange = 0;
    const seenKeys = new Set<string>();
    const knownTrackIdsByName = new Map<string, string>();
    const entries: Array<ParsedHistoryPlay> = [];

    for (const entry of extendedParsed.output) {
      const trackId = extractSpotifyTrackId(entry.spotify_track_uri);
      if (!trackId) {
        skippedNonMusic += 1;
        continue;
      }
      const trackName = entry.master_metadata_track_name ?? undefined;
      const artistName = entry.master_metadata_album_artist_name ?? undefined;
      if (trackName && artistName) {
        knownTrackIdsByName.set(normalizeTrackLookupKey(trackName, artistName), trackId);
      }
      if (entry.ms_played < minMsPlayed) {
        skippedShortPlays += 1;
        continue;
      }
      const playedAt = new Date(entry.ts);
      if (Number.isNaN(playedAt.getTime())) {
        throw new Error(`Invalid timestamp "${entry.ts}" in Spotify streaming history`);
      }
      if ((from && playedAt < from) || (to && playedAt > to)) {
        skippedOutOfRange += 1;
        continue;
      }
      const dedupKey = `${playedAt.getTime()}|${trackId}`;
      if (!seenKeys.has(dedupKey)) {
        seenKeys.add(dedupKey);
        entries.push({
          artistName,
          msPlayed: entry.ms_played,
          playedAt,
          precision: 'second',
          trackId,
          trackName,
        });
      }
    }

    entries.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
    return {
      entries,
      knownTrackIdsByName,
      skippedNonMusic,
      skippedOutOfRange,
      skippedShortPlays,
      totalEntries: extendedParsed.output.length,
    };
  }

  const basicParsed = v.safeParse(basicStreamingHistorySchema, raw);
  if (basicParsed.success) {
    let skippedNonMusic = 0;
    let skippedShortPlays = 0;
    let skippedOutOfRange = 0;
    const seenKeys = new Set<string>();
    const entries: Array<ParsedHistoryPlay> = [];

    for (const entry of basicParsed.output) {
      const trackName = entry.trackName?.trim();
      const artistName = entry.artistName?.trim();
      if (!trackName || !artistName) {
        skippedNonMusic += 1;
        continue;
      }
      if (entry.msPlayed < minMsPlayed) {
        skippedShortPlays += 1;
        continue;
      }
      const playedAt = parseBasicEndTime(entry.endTime);
      if ((from && playedAt < from) || (to && playedAt > to)) {
        skippedOutOfRange += 1;
        continue;
      }
      const lookupKey = normalizeTrackLookupKey(trackName, artistName);
      const dedupKey = `${playedAt.getTime()}|${lookupKey}`;
      if (!seenKeys.has(dedupKey)) {
        seenKeys.add(dedupKey);
        entries.push({
          artistName,
          msPlayed: entry.msPlayed,
          playedAt,
          precision: 'minute',
          trackName,
        });
      }
    }

    entries.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());
    return {
      entries,
      knownTrackIdsByName: new Map(),
      skippedNonMusic,
      skippedOutOfRange,
      skippedShortPlays,
      totalEntries: basicParsed.output.length,
    };
  }

  v.parse(extendedStreamingHistorySchema, raw);
  throw new Error('Unreachable');
}

export function mergeParsedHistories(
  histories: ReadonlyArray<ParsedStreamingHistory>,
): ParsedStreamingHistory {
  const knownTrackIdsByName = new Map<string, string>();
  let skippedNonMusic = 0;
  let skippedOutOfRange = 0;
  let skippedShortPlays = 0;
  let totalEntries = 0;

  for (const history of histories) {
    skippedNonMusic += history.skippedNonMusic;
    skippedOutOfRange += history.skippedOutOfRange;
    skippedShortPlays += history.skippedShortPlays;
    totalEntries += history.totalEntries;
    for (const [k, vId] of history.knownTrackIdsByName) {
      knownTrackIdsByName.set(k, vId);
    }
  }

  const seenExact = new Set<string>();
  const secondByTrack = new Map<string, Array<number>>();
  const secondByName = new Map<string, Array<number>>();
  const entries: Array<ParsedHistoryPlay> = [];

  for (const history of histories) {
    for (const entry of history.entries) {
      if (entry.precision !== 'second' || !entry.trackId) {
        continue;
      }
      const key = `${entry.playedAt.getTime()}|${entry.trackId}`;
      if (seenExact.has(key)) {
        continue;
      }
      seenExact.add(key);
      entries.push(entry);
      const ts = entry.playedAt.getTime();
      const trackTimes = secondByTrack.get(entry.trackId) ?? [];
      trackTimes.push(ts);
      secondByTrack.set(entry.trackId, trackTimes);
      if (entry.trackName && entry.artistName) {
        const nameKey = normalizeTrackLookupKey(entry.trackName, entry.artistName);
        const nameTimes = secondByName.get(nameKey) ?? [];
        nameTimes.push(ts);
        secondByName.set(nameKey, nameTimes);
      }
    }
  }

  for (const history of histories) {
    for (const entry of history.entries) {
      if (entry.precision !== 'minute') {
        continue;
      }
      const nameKey =
        entry.trackName && entry.artistName
          ? normalizeTrackLookupKey(entry.trackName, entry.artistName)
          : undefined;
      const resolvedTrackId =
        entry.trackId ?? (nameKey ? knownTrackIdsByName.get(nameKey) : undefined);
      const ts = entry.playedAt.getTime();

      const matchingTrackTimes = resolvedTrackId ? secondByTrack.get(resolvedTrackId) : undefined;
      const matchingNameTimes = nameKey ? secondByName.get(nameKey) : undefined;
      const coveredBySecondPrecision =
        matchingTrackTimes?.some((secTs) => Math.abs(secTs - ts) <= MINUTE_DEDUP_WINDOW_MS) ||
        matchingNameTimes?.some((secTs) => Math.abs(secTs - ts) <= MINUTE_DEDUP_WINDOW_MS);

      if (coveredBySecondPrecision) {
        continue;
      }

      const dedupKey = `${ts}|${resolvedTrackId ?? nameKey ?? ''}`;
      if (seenExact.has(dedupKey)) {
        continue;
      }
      seenExact.add(dedupKey);
      entries.push(resolvedTrackId ? { ...entry, trackId: resolvedTrackId } : entry);
    }
  }

  entries.sort((a, b) => a.playedAt.getTime() - b.playedAt.getTime());

  return {
    entries,
    knownTrackIdsByName,
    skippedNonMusic,
    skippedOutOfRange,
    skippedShortPlays,
    totalEntries,
  };
}

export function extractZipJsonFiles(zipBuffer: Buffer): Array<{ fileName: string; text: string }> {
  const minEocdOffset = Math.max(0, zipBuffer.length - 65_557);
  let eocdOffset = -1;
  for (let i = zipBuffer.length - 22; i >= minEocdOffset; i -= 1) {
    if (zipBuffer.readUInt32LE(i) === ZIP_EOCD_SIGNATURE) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) {
    throw new Error('Invalid ZIP archive: End of Central Directory signature not found');
  }

  const totalEntries = zipBuffer.readUInt16LE(eocdOffset + 10);
  let cdOffset = zipBuffer.readUInt32LE(eocdOffset + 16);
  const files: Array<{ fileName: string; text: string }> = [];

  for (let i = 0; i < totalEntries; i += 1) {
    if (zipBuffer.readUInt32LE(cdOffset) !== ZIP_CD_SIGNATURE) {
      throw new Error('Invalid ZIP archive: Central Directory header signature mismatch');
    }
    const compressionMethod = zipBuffer.readUInt16LE(cdOffset + 10);
    const compressedSize = zipBuffer.readUInt32LE(cdOffset + 20);
    const fileNameLength = zipBuffer.readUInt16LE(cdOffset + 28);
    const extraLength = zipBuffer.readUInt16LE(cdOffset + 30);
    const commentLength = zipBuffer.readUInt16LE(cdOffset + 32);
    const localHeaderOffset = zipBuffer.readUInt32LE(cdOffset + 42);
    const fileName = zipBuffer.toString('utf8', cdOffset + 46, cdOffset + 46 + fileNameLength);
    cdOffset += 46 + fileNameLength + extraLength + commentLength;

    if (
      !fileName.endsWith('.json') ||
      fileName.startsWith('__MACOSX/') ||
      fileName.includes('/._')
    ) {
      continue;
    }
    if (zipBuffer.readUInt32LE(localHeaderOffset) !== ZIP_LFH_SIGNATURE) {
      throw new Error(`Invalid ZIP archive: Local file header mismatch for "${fileName}"`);
    }
    const localNameLength = zipBuffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = zipBuffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const slice = zipBuffer.subarray(dataStart, dataStart + compressedSize);

    if (compressionMethod === ZIP_METHOD_STORE) {
      files.push({ fileName, text: slice.toString('utf8') });
    } else if (compressionMethod === ZIP_METHOD_DEFLATE) {
      files.push({ fileName, text: inflateRawSync(slice).toString('utf8') });
    } else {
      throw new Error(`Unsupported ZIP compression method ${compressionMethod} for "${fileName}"`);
    }
  }

  return files;
}
