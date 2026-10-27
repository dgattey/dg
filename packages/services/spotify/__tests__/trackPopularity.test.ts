import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import {
  captureSyncedPopularity,
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

const refused = (status: number, retryAfterSeconds?: number) => ({
  response: { json: async () => ({}) },
  ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
  status,
});

const echoTracks = (popularity: number) => async (resource: string) =>
  spotifyTracks(
    resource
      .replace('tracks?ids=', '')
      .split(',')
      .map((id) => ({ id, popularity })),
  );

const play = (trackId: string, day = 1) => ({
  albumId: 'album',
  artistIds: ['artist'],
  playedAt: new Date(Date.UTC(2015, 0, day)),
  trackId,
});

beforeEach(async () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  await db.MusicTrackPopularity.destroy({ where: {} });
  await db.SyncBackoff.destroy({ where: {} });
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
    expect(result).toEqual({ deezer: 1, remaining: [], spotify: 1, unmatched: 1 });
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
    mockSpotifyGet.mockResolvedValue(refused(429, 12));

    const result = await captureTrackPopularity(['track-a'], CAPTURED_AT);

    expect(result).toEqual({
      deezer: 0,
      failure: { retryAfterSeconds: 12, status: 429 },
      remaining: ['track-a'],
      spotify: 0,
      unmatched: 0,
    });
    expect(await db.MusicTrackPopularity.count()).toBe(0);
  });

  it('keeps rows from earlier calls when a later call is refused or throws', async () => {
    const ids = Array.from({ length: 120 }, (_, i) => `track-${String(i).padStart(3, '0')}`);
    const firstCall = echoTracks(55);
    mockSpotifyGet
      .mockImplementationOnce(firstCall)
      .mockRejectedValueOnce(new Error('socket hang up'));

    const thrown = await captureTrackPopularity(ids, CAPTURED_AT);

    expect(thrown).toEqual({
      deezer: 0,
      failure: {},
      remaining: ids.slice(50),
      spotify: 50,
      unmatched: 0,
    });
    expect(await db.MusicTrackPopularity.count()).toBe(50);

    mockSpotifyGet.mockImplementationOnce(firstCall).mockResolvedValueOnce(refused(503));

    const refusedLater = await captureTrackPopularity(thrown.remaining, CAPTURED_AT);

    expect(refusedLater).toMatchObject({
      failure: { status: 503 },
      remaining: ids.slice(100),
      spotify: 50,
    });
    expect(await db.MusicTrackPopularity.count()).toBe(100);
  });
});

describe('captureSyncedPopularity', () => {
  const backoff = async () => await db.SyncBackoff.findByPk('spotify:track-popularity');

  it('scores the synced tracks, then only played tracks with no snapshot from any source', async () => {
    await db.SpotifyPlay.bulkCreate([play('old', 1), play('old', 2), play('seen', 3)]);
    await db.MusicTrackPopularity.create({
      capturedOn: '2026-01-01',
      popularity: 30,
      source: 'deezer',
      trackId: 'seen',
    });
    mockSpotifyGet.mockImplementation(echoTracks(22));

    expect(await selectTracksMissingPopularity()).toEqual(['old']);
    await captureSyncedPopularity(['new']);

    expect(mockSpotifyGet.mock.calls.map(([resource]) => resource)).toEqual([
      'tracks?ids=new',
      'tracks?ids=old',
    ]);
    expect(await selectTracksMissingPopularity()).toEqual([]);
    expect(await backoff()).toBeNull();
  });

  it('holds Retry-After: 0 to a one-minute pause and skips Spotify until it passes', async () => {
    mockSpotifyGet.mockResolvedValue(refused(429, 0));
    const before = Date.now();

    await captureSyncedPopularity(['track-a']);

    const pause = await backoff();
    expect(pause?.failures).toBe(1);
    expect(pause?.retryAt.getTime()).toBeGreaterThanOrEqual(before + 60_000);
    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);

    await captureSyncedPopularity(['track-a']);
    expect(mockSpotifyGet).toHaveBeenCalledTimes(1);
  });

  it('stops on a refused capture and backs off longer each time Spotify keeps failing', async () => {
    await db.SpotifyPlay.bulkCreate([play('old')]);
    jest.spyOn(Math, 'random').mockReturnValue(1);
    mockSpotifyGet.mockResolvedValue(refused(502));
    const pauses: Array<number> = [];

    for (let run = 0; run < 3; run++) {
      await db.SyncBackoff.update({ retryAt: new Date(0) }, { where: {} });
      const before = Date.now();
      await captureSyncedPopularity(['track-a']);
      pauses.push(((await backoff())?.retryAt.getTime() ?? 0) - before);
    }

    expect(mockSpotifyGet).toHaveBeenCalledTimes(3);
    expect(mockSpotifyGet).not.toHaveBeenCalledWith('tracks?ids=old');
    expect((await backoff())?.failures).toBe(3);
    expect(pauses.map((ms) => Math.round(ms / 60_000))).toEqual([15, 30, 60]);

    await db.SyncBackoff.update({ retryAt: new Date(0) }, { where: {} });
    mockSpotifyGet.mockImplementation(echoTracks(40));
    await captureSyncedPopularity(['track-a']);
    expect(await backoff()).toBeNull();
  });
});
