describe('createSocialImage', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    const fetchMock = jest.fn().mockResolvedValue({
      arrayBuffer: async () => new ArrayBuffer(8),
    });
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'fetch', {
      value: originalFetch,
      writable: true,
    });
  });

  it('builds a URL with text and subtitle', async () => {
    const generateOpenGraphImage = jest.fn();
    jest.doMock('@dg/og/generateOpenGraphImage', () => ({
      generateOpenGraphImage,
    }));

    const { createSocialImage, SOCIAL_IMAGE_SIZE } = await import('../createSocialImage');

    createSocialImage('/opengraph-image', 'Hello', 'World');

    expect(generateOpenGraphImage).toHaveBeenCalledTimes(1);
    const args = generateOpenGraphImage.mock.calls[0][0];
    const url = new URL(args.url);
    expect(url.pathname).toBe('/opengraph-image');
    expect(url.searchParams.get('text')).toBe('Hello');
    expect(url.searchParams.get('subtitle')).toBe('World');
    expect(args.size).toEqual(SOCIAL_IMAGE_SIZE);
  });
});
