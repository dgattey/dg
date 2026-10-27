import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import {
  backfillTrackPopularity,
  captureTrackPopularity,
  deezerRankToPopularity,
  selectTracksMissingPopularity,
} from '../trackPopularity';

const mockSpotifyGet = jest.fn<
  Promise<{
    response: { json: () => Promise<unknown> };
    retryAfterSeconds?: number;
    status: number;
  }>,
  [string]
>();
const mockFetchDeezerTrack = jest.fn<Promise<Record<string, unknown> | null>, [string]>();

jest.mock('../spotifyClient', () => ({
  getSpotifyClient: () => ({ get: mockSpotifyGet }),
}));

jest.mock('../fetchTrackBpm', () => ({
  fetchDeezerTrack: (isrc: string) => mockFetchDeezerTrack(isrc),
}));

const db = setupTestDatabase();

/** 22:00 on Oct 26 in Pacific time, already Oct 27 in UTC. */
const CAPTURED_AT = new Date('2026-10-27T05:00:00.000Z');

const spotifyTracks = (tracks: Array<Record<string, unknown> | null>) => ({
  response: { json: async () => ({ tracks }) },
  status: 200,
});

const storedRows = async () =>
  (await db.MusicTrackPopularity.findAll({ order: [['trackId', 'ASC']], raw: true })).map(
    ({ capturedOn, popularity, source, trackId }) => ({
      capturedOn,
      popularity,
      source,
      trackId,
    }),
  );

beforeEach(async () => {
  jest.clearAllMocks();
  await db.MusicTrackPopularity.destroy({ where: {} });
  await db.SpotifyPlay.destroy({ where: {} });
});

describe('deezerRankToPopularity', () => {
  it('scales Deezer rank onto 0–100 and rejects non-ranks', () => {
    expect(deezerRankToPopularity(654_321)).toBe(65);
    expect(deezerRankToPopularity(2_000_000)).toBe(100);
    expect(deezerRankToPopularity(-1)).toBeNull();
    expect(deezerRankToPopularity('500000')).toBeNull();
  });
});

describe('captureTrackPopularity', () => {
  it('stores Spotify popularity on the Pacific day, falling back to Deezer only without it', async () => {
    mockSpotifyGet.mockResolvedValue(
      spotifyTracks([
        { external_ids: { isrc: 'GBAHT0500592' }, id: 'track-a', popularity: 80 },
        { external_ids: { isrc: 'USRC17607839' }, id: 'track-b' },
        null,
      ]),
    );
    mockFetchDeezerTrack.mockResolvedValue({ rank: 512_000 });

    const result = await captureTrackPopularity(['track-a', 'track-b', 'track-c'], CAPTURED_AT);

    expect(mockSpotifyGet).toHaveBeenCalledWith('tracks?ids=track-a,track-b,track-c');
    expect(mockFetchDeezerTrack).toHaveBeenCalledTimes(1);
    expect(mockFetchDeezerTrack).toHaveBeenCalledWith('USRC17607839');
    expect(result).toEqual({ deezer: 1, spotify: 1, stoppedEarly: false });
    expect(await storedRows()).toEqual([
      { capturedOn: '2026-10-26', popularity: 80, source: 'spotify', trackId: 'track-a' },
      { capturedOn: '2026-10-26', popularity: 51, source: 'deezer', trackId: 'track-b' },
    ]);
  });

  it('batches 50 ids per call and skips tracks already captured that day', async () => {
    const ids = Array.from({ length: 51 }, (_, i) => `track-${i}`);
    await db.MusicTrackPopularity.create({
      capturedOn: '2026-10-26',
      popularity: 10,
      source: 'spotify',
      trackId: 'track-0',
    });
    mockSpotifyGet.mockImplementation(async (resource) =>
      spotifyTracks(
        resource
          .replace('tracks?ids=', '')
          .split(',')
          .map((id) => ({ id, popularity: 40 })),
      ),
    );

    const result = await captureTrackPopularity(ids, CAPTURED_AT);

    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);
    expect(mockSpotifyGet.mock.calls[0]?.[0].split(',')).toHaveLength(50);
    expect(result.spotify).toBe(50);
    expect(await db.MusicTrackPopularity.count()).toBe(51);
  });

  it('stops at a refused call and reports the retry delay without throwing', async () => {
    mockSpotifyGet.mockResolvedValue({
      response: { json: async () => ({}) },
      retryAfterSeconds: 12,
      status: 429,
    });

    const result = await captureTrackPopularity(['track-a'], CAPTURED_AT);

    expect(result).toEqual({ deezer: 0, retryAfterSeconds: 12, spotify: 0, stoppedEarly: true });
    expect(await db.MusicTrackPopularity.count()).toBe(0);
  });
});

describe('backfillTrackPopularity', () => {
  it('scores only played tracks that have no snapshot from any source', async () => {
    await db.SpotifyPlay.bulkCreate([
      { albumId: 'album', artistIds: ['artist'], playedAt: new Date('2015-01-01'), trackId: 'old' },
      { albumId: 'album', artistIds: ['artist'], playedAt: new Date('2015-01-02'), trackId: 'old' },
      {
        albumId: 'album',
        artistIds: ['artist'],
        playedAt: new Date('2016-01-01'),
        trackId: 'seen',
      },
    ]);
    await db.MusicTrackPopularity.create({
      capturedOn: '2026-01-01',
      popularity: 30,
      source: 'deezer',
      trackId: 'seen',
    });
    mockSpotifyGet.mockResolvedValue(spotifyTracks([{ id: 'old', popularity: 22 }]));

    expect(await selectTracksMissingPopularity()).toEqual(['old']);
    const result = await backfillTrackPopularity();

    expect(mockSpotifyGet).toHaveBeenCalledWith('tracks?ids=old');
    expect(result.spotify).toBe(1);
    expect(await selectTracksMissingPopularity()).toEqual([]);
  });
});
