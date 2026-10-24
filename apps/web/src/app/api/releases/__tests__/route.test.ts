import { NextRequest } from 'next/server';

jest.mock('@dg/services/github/fetchReleases', () => ({
  GITHUB_REPOSITORY_URL: 'https://github.com/dgattey/dg',
  upsertRelease: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}));

import { upsertRelease } from '@dg/services/github/fetchReleases';
import { revalidateTag } from 'next/cache';
import { handleReleaseSync } from '../route';

const mockUpsertRelease = jest.mocked(upsertRelease);
const mockRevalidateTag = jest.mocked(revalidateTag);

const createRequest = (body: unknown, authorization?: string) =>
  new NextRequest('http://localhost/api/releases', {
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      ...(authorization ? { authorization } : {}),
    },
    method: 'POST',
  });

const originalCronSecret = process.env.CRON_SECRET;

beforeAll(() => {
  process.env.CRON_SECRET = 'test-secret';
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  process.env.CRON_SECRET = originalCronSecret;
});

describe('POST /api/releases', () => {
  it('rejects unauthorized requests', async () => {
    const response = await handleReleaseSync(createRequest({ version: 'v2.86.0' }));
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized', ok: false });
    expect(mockUpsertRelease).not.toHaveBeenCalled();
  });

  it('upserts the release row and revalidates the changelog tag', async () => {
    mockUpsertRelease.mockResolvedValue({
      htmlUrl: 'https://github.com/dgattey/dg/releases/tag/v2.86.0',
      kind: 'minor',
      major: 2,
      minor: 86,
      name: 'v2.86.0',
      notes: ['Added dual-write release storage (#693).'],
      patch: 0,
      prNumbers: [693],
      publishedAt: '2026-10-24T08:00:00.000Z',
      tag: 'v2.86.0',
      version: '2.86.0',
    });

    const response = await handleReleaseSync(
      createRequest(
        {
          body: '- Added dual-write release storage (#693).',
          publishedAt: '2026-10-24T08:00:00.000Z',
          url: 'https://github.com/dgattey/dg/releases/tag/v2.86.0',
          version: '2.86.0',
        },
        'Bearer test-secret',
      ),
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, version: 'v2.86.0' });
    expect(mockUpsertRelease).toHaveBeenCalledWith({
      body: '- Added dual-write release storage (#693).',
      publishedAt: '2026-10-24T08:00:00.000Z',
      url: 'https://github.com/dgattey/dg/releases/tag/v2.86.0',
      version: 'v2.86.0',
    });
    expect(mockRevalidateTag).toHaveBeenCalledWith('changelog', 'max');
  });
});
