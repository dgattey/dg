import { setupTestDatabase } from '@dg/db/testing/databaseSetup';
import { fetchTrackBpm } from '../fetchTrackBpm';
import { clearTrackTempoMemo, getTrackBpm, TRACK_TEMPO_RETRY_MS } from '../trackTempo';

jest.mock('../fetchTrackBpm', () => ({
  ...jest.requireActual('../fetchTrackBpm'),
  fetchTrackBpm: jest.fn(),
}));

const ISRC = 'USQX91300809';

const db = setupTestDatabase();

beforeEach(async () => {
  jest.mocked(fetchTrackBpm).mockReset();
  clearTrackTempoMemo();
  await db.MusicTrackTempo.destroy({ where: {} });
});

async function storedRow() {
  const row = await db.MusicTrackTempo.findByPk(ISRC);
  return row ? { bpm: row.bpm, status: row.status } : null;
}

describe('getTrackBpm', () => {
  it('looks up a new recording on Deezer and stores the tempo permanently', async () => {
    jest.mocked(fetchTrackBpm).mockResolvedValue(116.13);

    await expect(getTrackBpm(ISRC)).resolves.toBeCloseTo(116.13, 2);

    expect(fetchTrackBpm).toHaveBeenCalledWith(ISRC);
    const stored = await storedRow();
    expect(stored?.status).toBe('found');
    expect(stored?.bpm).toBeCloseTo(116.13, 2);
  });

  it('reads a stored tempo without asking Deezer', async () => {
    await db.MusicTrackTempo.create({
      bpm: 98,
      checkedAt: new Date(0),
      isrc: ISRC,
      status: 'found',
    });

    await expect(getTrackBpm(ISRC)).resolves.toBe(98);
    expect(fetchTrackBpm).not.toHaveBeenCalled();
  });

  it('stores "Deezer has no tempo" permanently and never asks again', async () => {
    jest.mocked(fetchTrackBpm).mockResolvedValue(null);

    await expect(getTrackBpm(ISRC)).resolves.toBeNull();
    expect(await storedRow()).toEqual({ bpm: null, status: 'missing' });

    clearTrackTempoMemo();
    await expect(getTrackBpm(ISRC)).resolves.toBeNull();
    expect(fetchTrackBpm).toHaveBeenCalledTimes(1);
  });

  it('records a failure and waits about an hour before retrying', async () => {
    jest
      .mocked(fetchTrackBpm)
      .mockRejectedValue(new DOMException('The operation timed out.', 'TimeoutError'));

    await expect(getTrackBpm(ISRC)).resolves.toBeNull();
    expect(await storedRow()).toEqual({ bpm: null, status: 'failed' });

    clearTrackTempoMemo();
    await expect(getTrackBpm(ISRC)).resolves.toBeNull();
    expect(fetchTrackBpm).toHaveBeenCalledTimes(1);

    await db.MusicTrackTempo.update(
      { checkedAt: new Date(Date.now() - TRACK_TEMPO_RETRY_MS - 1000) },
      { where: { isrc: ISRC } },
    );
    clearTrackTempoMemo();
    jest.mocked(fetchTrackBpm).mockResolvedValue(116.13);

    await expect(getTrackBpm(ISRC)).resolves.toBeCloseTo(116.13, 2);
    expect(fetchTrackBpm).toHaveBeenCalledTimes(2);
    expect((await storedRow())?.status).toBe('found');
  });

  it('skips Postgres and Deezer for a recording this instance already resolved', async () => {
    jest.mocked(fetchTrackBpm).mockResolvedValue(116.13);
    await getTrackBpm(ISRC);
    await db.MusicTrackTempo.destroy({ where: {} });

    await expect(getTrackBpm(ISRC)).resolves.toBeCloseTo(116.13, 2);
    expect(fetchTrackBpm).toHaveBeenCalledTimes(1);
    expect(await storedRow()).toBeNull();
  });

  it('shares one lookup between concurrent reads', async () => {
    jest.mocked(fetchTrackBpm).mockResolvedValue(120);

    await expect(Promise.all([getTrackBpm(ISRC), getTrackBpm(ISRC)])).resolves.toEqual([120, 120]);
    expect(fetchTrackBpm).toHaveBeenCalledTimes(1);
  });

  it('normalizes ISRC casing and ignores malformed ISRCs', async () => {
    jest.mocked(fetchTrackBpm).mockResolvedValue(120);

    await expect(getTrackBpm(ISRC.toLowerCase())).resolves.toBe(120);
    expect(fetchTrackBpm).toHaveBeenCalledWith(ISRC);
    await expect(getTrackBpm('not-an-isrc')).resolves.toBeNull();
    expect(fetchTrackBpm).toHaveBeenCalledTimes(1);
  });
});
