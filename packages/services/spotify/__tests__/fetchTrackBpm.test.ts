import { DEEZER_TIMEOUT_MS, fetchTrackBpm, MAX_BPM, MIN_BPM, normalizeBpm } from '../fetchTrackBpm';

const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

describe('normalizeBpm', () => {
  it.each([
    [116.13, 116.13],
    [MIN_BPM, MIN_BPM],
    [MAX_BPM, MAX_BPM],
    [60, 120],
    [34.5, 138],
    [200, 100],
    [480, 120],
    [181, 90.5],
  ])('folds %p into %p', (raw, expected) => {
    expect(normalizeBpm(raw)).toBe(expected);
  });

  it.each([[0], [-90], [Number.NaN], [Number.POSITIVE_INFINITY], [undefined], [null], ['120']])(
    'treats %p as unknown',
    (raw) => {
      expect(normalizeBpm(raw)).toBeNull();
    },
  );

  it('always lands inside the readable range', () => {
    for (let raw = 1; raw <= 1000; raw += 0.7) {
      const bpm = normalizeBpm(raw);
      expect(bpm).not.toBeNull();
      expect(bpm).toBeGreaterThanOrEqual(MIN_BPM);
      expect(bpm).toBeLessThanOrEqual(MAX_BPM);
    }
  });
});

describe('fetchTrackBpm', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('looks the ISRC up on Deezer without the Next data cache', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ bpm: 116.13, id: 1 }));

    await expect(fetchTrackBpm('usqx91300809')).resolves.toBe(116.13);

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(input).toBe('https://api.deezer.com/track/isrc:USQX91300809');
    expect(init).toEqual(expect.objectContaining({ cache: 'no-store' }));
  });

  it('normalizes half-time readings', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ bpm: 52 }));

    await expect(fetchTrackBpm('GBUM72000433')).resolves.toBe(104);
  });

  it('resolves null when Deezer reports a zero tempo', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ bpm: 0, id: 1 }));

    await expect(fetchTrackBpm('GBUM72000433')).resolves.toBeNull();
  });

  it('resolves null when Deezer omits the tempo', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1 }));

    await expect(fetchTrackBpm('GBUM72000433')).resolves.toBeNull();
  });

  it('resolves null when Deezer has no track for the ISRC', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 800, message: 'no data', type: 'DataException' } }),
    );

    await expect(fetchTrackBpm('ZZZZZ0000000')).resolves.toBeNull();
  });

  it('skips the request for a malformed ISRC', async () => {
    await expect(fetchTrackBpm('not-an-isrc')).resolves.toBeNull();
    await expect(fetchTrackBpm('')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws on quota errors so the miss is not cached', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 4, message: 'Quota limit exceeded', type: 'Exception' } }),
    );

    await expect(fetchTrackBpm('GBUM72000433')).rejects.toThrow('error 4');
  });

  it('throws on HTTP failures', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 503));

    await expect(fetchTrackBpm('GBUM72000433')).rejects.toThrow('status 503');
  });

  it('gives up once Deezer takes longer than the timeout', async () => {
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(init.signal?.reason));
        }),
    );

    const startedAt = performance.now();
    await expect(fetchTrackBpm('GBUM72000433')).rejects.toMatchObject({ name: 'TimeoutError' });
    const elapsedMs = performance.now() - startedAt;

    expect(DEEZER_TIMEOUT_MS).toBe(800);
    expect(elapsedMs).toBeGreaterThanOrEqual(DEEZER_TIMEOUT_MS - 50);
    expect(elapsedMs).toBeLessThan(DEEZER_TIMEOUT_MS + 500);
  });

  it('throws when the network request fails', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    await expect(fetchTrackBpm('GBUM72000433')).rejects.toThrow('network');
  });
});
