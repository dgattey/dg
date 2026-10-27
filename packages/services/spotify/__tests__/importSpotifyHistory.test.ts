import { deflateRawSync } from 'node:zlib';
import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { importSpotifyHistory, importSpotifyHistoryEntries } from '../importSpotifyHistory';
import {
  extractSpotifyTrackId,
  extractZipJsonFiles,
  mergeParsedHistories,
  parseExtendedStreamingHistory,
} from '../parseSpotifyHistoryExport';

const mockSpotifyGet = jest.fn<
  Promise<{
    response: { json: () => Promise<unknown> };
    retryAfterSeconds?: number;
    status: number;
  }>,
  [string]
>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

const mockCaptureTrackPopularity = jest.fn();

jest.mock('../trackPopularity', () => ({
  captureTrackPopularity: (...args: Array<unknown>) => mockCaptureTrackPopularity(...args),
  summarizeCapture: jest.fn(() => ({})),
}));

const TRACK_1 = '000000000000000import1';
const TRACK_2 = '000000000000000import2';
const TRACK_3 = '000000000000000import3';
const ALBUM_1 = '0000000000000000album1';
const ARTIST_1 = '000000000000000artist1';

const db = setupTestDatabase();

function buildSingleTrackResponse(trackId: string, albumId = ALBUM_1, artistIds = [ARTIST_1]) {
  return {
    album: {
      external_urls: { spotify: `https://open.spotify.com/album/${albumId}` },
      id: albumId,
      images: [{ height: 640, url: 'https://i.scdn.co/image/cover.jpg', width: 640 }],
      name: `Album ${albumId}`,
    },
    artists: artistIds.map((id, i) => ({
      external_urls: { spotify: `https://open.spotify.com/artist/${id}` },
      id,
      name: `Artist ${i + 1}`,
    })),
    external_urls: { spotify: `https://open.spotify.com/track/${trackId}` },
    id: trackId,
    name: `Track ${trackId}`,
  };
}

function createExtendedJson(
  entries: ReadonlyArray<{
    artistName?: string;
    msPlayed?: number;
    trackName?: string;
    trackUri: string | null;
    ts: string;
  }>,
): string {
  return JSON.stringify(
    entries.map((entry) => ({
      master_metadata_album_artist_name: entry.artistName ?? null,
      master_metadata_track_name: entry.trackName ?? null,
      ms_played: entry.msPlayed ?? 180_000,
      spotify_track_uri: entry.trackUri,
      ts: entry.ts,
    })),
  );
}

function buildTestZip(
  files: ReadonlyArray<{ compress?: boolean; name: string; text: string }>,
): Buffer {
  const localParts: Array<Buffer> = [];
  const centralParts: Array<Buffer> = [];
  let offset = 0;

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, 'utf8');
    const rawBuf = Buffer.from(file.text, 'utf8');
    const dataBuf = file.compress ? deflateRawSync(rawBuf) : rawBuf;
    const method = file.compress ? 8 : 0;

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt32LE(dataBuf.length, 18);
    localHeader.writeUInt32LE(rawBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt32LE(dataBuf.length, 20);
    centralHeader.writeUInt32LE(rawBuf.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt32LE(offset, 42);

    localParts.push(localHeader, nameBuf, dataBuf);
    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + dataBuf.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(offset, 16);

  return Buffer.concat([...localParts, ...centralParts, eocd]);
}

describe('extractSpotifyTrackId', () => {
  it('extracts valid 22-character Spotify track IDs and rejects non-track URIs', () => {
    expect(extractSpotifyTrackId(`spotify:track:${TRACK_1}`)).toBe(TRACK_1);
    expect(extractSpotifyTrackId('spotify:episode:000000000000000import1')).toBeNull();
    expect(extractSpotifyTrackId('spotify:track:short')).toBeNull();
    expect(extractSpotifyTrackId(null)).toBeNull();
  });
});

describe('parseExtendedStreamingHistory', () => {
  it('filters non-music, short plays, and out-of-range dates while deduplicating', () => {
    const json = createExtendedJson([
      { msPlayed: 200_000, trackUri: `spotify:track:${TRACK_1}`, ts: '2026-04-10T12:00:00Z' },
      { msPlayed: 200_000, trackUri: `spotify:track:${TRACK_1}`, ts: '2026-04-10T12:00:00Z' },
      { msPlayed: 5_000, trackUri: `spotify:track:${TRACK_2}`, ts: '2026-04-11T12:00:00Z' },
      { msPlayed: 200_000, trackUri: `spotify:track:${TRACK_3}`, ts: '2026-01-15T12:00:00Z' },
      { msPlayed: 200_000, trackUri: null, ts: '2026-04-12T12:00:00Z' },
    ]);

    const parsed = parseExtendedStreamingHistory(json, {
      from: new Date('2026-03-01T00:00:00Z'),
      minMsPlayed: 30_000,
      to: new Date('2026-07-31T23:59:59Z'),
    });

    expect(parsed.totalEntries).toBe(5);
    expect(parsed.skippedNonMusic).toBe(1);
    expect(parsed.skippedShortPlays).toBe(1);
    expect(parsed.skippedOutOfRange).toBe(1);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0]?.trackId).toBe(TRACK_1);
  });

  it('parses basic Spotify Account Data StreamingHistory_music_0.json and deduplicates against Extended history', () => {
    const extended = parseExtendedStreamingHistory(
      createExtendedJson([
        {
          artistName: 'ODESZA',
          msPlayed: 214_000,
          trackName: 'A Moment Apart',
          trackUri: `spotify:track:${TRACK_1}`,
          ts: '2026-04-15T18:54:38Z',
        },
      ]),
    );
    const basic = parseExtendedStreamingHistory(
      JSON.stringify([
        {
          artistName: 'ODESZA',
          endTime: '2026-04-15 18:54',
          msPlayed: 214_000,
          trackName: 'A Moment Apart',
        },
        {
          artistName: 'ODESZA',
          endTime: '2026-05-01 20:15',
          msPlayed: 214_000,
          trackName: 'A Moment Apart',
        },
      ]),
    );

    const merged = mergeParsedHistories([extended, basic]);
    expect(merged.entries).toHaveLength(2);
    expect(merged.entries[0]?.playedAt.toISOString()).toBe('2026-04-15T18:54:38.000Z');
    expect(merged.entries[1]?.playedAt.toISOString()).toBe('2026-05-01T20:15:00.000Z');
    expect(merged.entries[1]?.trackId).toBe(TRACK_1);
  });
});

describe('extractZipJsonFiles', () => {
  it('extracts stored and deflated JSON files while skipping macOS resource forks', () => {
    const zip = buildTestZip([
      {
        compress: false,
        name: 'Spotify Extended Streaming History/Streaming_History_Audio_2026_1.json',
        text: '[{"ts":"2026-04-01T00:00:00Z"}]',
      },
      {
        compress: true,
        name: 'Spotify Account Data/StreamingHistory_music_0.json',
        text: '[{"endTime":"2026-05-01 00:00"}]',
      },
      {
        compress: false,
        name: '__MACOSX/._Streaming_History_Audio_2026_1.json',
        text: 'junk',
      },
      {
        compress: false,
        name: 'Spotify Extended Streaming History/ReadMeFirst.pdf',
        text: 'pdf',
      },
    ]);

    const extracted = extractZipJsonFiles(zip);
    expect(extracted).toEqual([
      {
        fileName: 'Spotify Extended Streaming History/Streaming_History_Audio_2026_1.json',
        text: '[{"ts":"2026-04-01T00:00:00Z"}]',
      },
      {
        fileName: 'Spotify Account Data/StreamingHistory_music_0.json',
        text: '[{"endTime":"2026-05-01 00:00"}]',
      },
    ]);
  });
});

describe('importSpotifyHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCaptureTrackPopularity.mockResolvedValue({
      deezer: 0,
      remaining: [],
      spotify: 0,
      unmatched: 0,
    });
  });

  it('imports new plays, resolves metadata, and is idempotent on re-import', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => buildSingleTrackResponse(TRACK_1) },
      status: 200,
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${TRACK_1}`, ts: '2026-04-15T18:54:38Z' },
      { trackUri: null, ts: '2026-04-15T19:00:00Z' },
    ]);

    const first = await importSpotifyHistory(fileText);
    expect(first).toEqual({
      alreadyInDb: 0,
      failedTrackIds: [],
      imported: 1,
      musicEntries: 1,
      skippedNonMusic: 1,
      skippedOutOfRange: 0,
      skippedShortPlays: 0,
      totalEntries: 2,
    });
    expect(mockCaptureTrackPopularity).toHaveBeenCalledWith([TRACK_1]);

    const second = await importSpotifyHistory(fileText);
    expect(second.imported).toBe(0);
    expect(second.alreadyInDb).toBe(1);
    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);
  });

  it('skips GDPR plays that already exist within 10s as millisecond-precision API plays', async () => {
    await db.SpotifyPlay.create({
      albumId: ALBUM_1,
      artistIds: [ARTIST_1],
      playedAt: new Date('2026-03-06T22:46:09.103Z'),
      trackId: TRACK_2,
    });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${TRACK_2}`, ts: '2026-03-06T22:46:07Z' },
    ]);

    const result = await importSpotifyHistory(fileText);
    expect(result.imported).toBe(0);
    expect(result.alreadyInDb).toBe(1);
    expect(mockSpotifyGet).not.toHaveBeenCalled();
  });

  it('resolves basic StreamingHistory_music_0.json plays via Spotify search when not in DB', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: {
        json: async () => ({
          tracks: { items: [buildSingleTrackResponse(TRACK_3)] },
        }),
      },
      status: 200,
    });

    const basicJson = JSON.stringify([
      {
        artistName: 'Artist 1',
        endTime: '2026-06-12 14:20',
        msPlayed: 195_000,
        trackName: `Track ${TRACK_3}`,
      },
    ]);

    const parsed = parseExtendedStreamingHistory(basicJson);
    const result = await importSpotifyHistoryEntries(parsed);
    expect(result.imported).toBe(1);
    expect(result.failedTrackIds).toEqual([]);
  });

  it('performs a dry run without calling Spotify API or inserting rows', async () => {
    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${TRACK_3}`, ts: '2026-05-20T20:00:00Z' },
    ]);

    const result = await importSpotifyHistory(fileText, { dryRun: true });
    expect(result.imported).toBe(1);
    expect(mockSpotifyGet).not.toHaveBeenCalled();

    const count = await db.SpotifyPlay.count({ where: { trackId: TRACK_3 } });
    expect(count).toBe(0);
  });

  it('retries 429 rate limits using Retry-After when resolving track metadata', async () => {
    mockSpotifyGet
      .mockResolvedValueOnce({
        response: { json: async () => ({}) },
        retryAfterSeconds: 0,
        status: 429,
      })
      .mockResolvedValueOnce({
        response: { json: async () => buildSingleTrackResponse(TRACK_3) },
        status: 200,
      });

    const fileText = createExtendedJson([
      { trackUri: `spotify:track:${TRACK_3}`, ts: '2026-06-01T20:00:00Z' },
    ]);

    const result = await importSpotifyHistory(fileText);
    expect(result.imported).toBe(1);
    expect(result.failedTrackIds).toEqual([]);
    expect(mockSpotifyGet).toHaveBeenCalledTimes(2);
  });
});
