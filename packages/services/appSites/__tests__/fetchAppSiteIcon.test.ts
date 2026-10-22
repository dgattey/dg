import { fetchAppSiteIcon } from '../fetchAppSiteIcon';

const fetchMock = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

function pngBytes(width: number, height: number): ArrayBuffer {
  const buffer = new ArrayBuffer(64);
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  view.setUint32(8, 13);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return buffer;
}

function requestUrl(input: Parameters<typeof fetch>[0]): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input instanceof URL) {
    return input.toString();
  }
  return input.url;
}

describe('fetchAppSiteIcon', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('returns IHDR dimensions and the absolute /icon.png URL', async () => {
    fetchMock.mockResolvedValue(new Response(pngBytes(320, 256), { status: 200 }));

    await expect(fetchAppSiteIcon('https://photos.gattey.com')).resolves.toEqual({
      height: 256,
      title: null,
      url: 'https://photos.gattey.com/icon.png',
      width: 320,
    });

    const [input, init] = fetchMock.mock.calls[0] ?? [];
    expect(requestUrl(input ?? '')).toBe('https://photos.gattey.com/icon.png');
    expect(init).toEqual(
      expect.objectContaining({
        headers: { Range: 'bytes=0-23' },
      }),
    );
  });

  it('uses /app-icon.png when /icon.png is missing', async () => {
    fetchMock.mockImplementation((input) => {
      const url = requestUrl(input);
      if (url.endsWith('/icon.png')) {
        return Promise.resolve(new Response('missing', { status: 404 }));
      }
      return Promise.resolve(new Response(pngBytes(1024, 768), { status: 206 }));
    });

    await expect(fetchAppSiteIcon('https://saga.gattey.com')).resolves.toEqual({
      height: 768,
      title: null,
      url: 'https://saga.gattey.com/app-icon.png',
      width: 1024,
    });
    expect(fetchMock.mock.calls.map(([input]) => requestUrl(input ?? ''))).toEqual([
      'https://saga.gattey.com/icon.png',
      'https://saga.gattey.com/app-icon.png',
    ]);
  });

  it('returns null for a non-gattey host without fetching', async () => {
    await expect(fetchAppSiteIcon('https://example.com')).resolves.toBeNull();
    await expect(fetchAppSiteIcon('https://notgattey.com')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns null when the body is not a PNG', async () => {
    fetchMock.mockResolvedValue(new Response(new ArrayBuffer(32), { status: 200 }));

    await expect(fetchAppSiteIcon('https://photos.gattey.com')).resolves.toBeNull();
  });

  it('returns null when fetch rejects', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    await expect(fetchAppSiteIcon('https://photos.gattey.com')).resolves.toBeNull();
  });
});
