import { homeRoute, internalGreenhouseHomeRoute } from '@dg/shared-core/routes/app';
import { NextRequest } from 'next/server';
import { greenhouseRewritePath, publicPathForInternalGreenhouse } from '../greenhouseRewrite';

const mockInteractiveRedesign = jest.fn<Promise<boolean>, [unknown]>();

jest.mock('../../flags', () => ({
  interactiveRedesign: (request: unknown) => mockInteractiveRedesign(request),
}));

const requestFor = (path: string) => new NextRequest(`https://example.com${path}`);

describe('greenhouseRewrite', () => {
  const originalVercelEnv = process.env.VERCEL_ENV;

  beforeEach(() => {
    mockInteractiveRedesign.mockResolvedValue(false);
    delete process.env.GREENHOUSE_PREVIEW;
    delete process.env.VERCEL_ENV;
  });

  afterEach(() => {
    delete process.env.GREENHOUSE_PREVIEW;
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = originalVercelEnv;
    }
  });

  it('returns null for flag-off home', async () => {
    expect(await greenhouseRewritePath(requestFor(homeRoute))).toBeNull();
  });

  it('rewrites flag-on home to the internal route', async () => {
    mockInteractiveRedesign.mockResolvedValue(true);
    expect(await greenhouseRewritePath(requestFor(homeRoute))).toBe(internalGreenhouseHomeRoute);
  });

  it('does not rewrite music paths even when the flag is on', async () => {
    mockInteractiveRedesign.mockResolvedValue(true);
    expect(await greenhouseRewritePath(requestFor('/music'))).toBeNull();
    expect(await greenhouseRewritePath(requestFor('/music/albums'))).toBeNull();
  });

  it('maps a direct internal hit back to the public homepage', () => {
    expect(publicPathForInternalGreenhouse(internalGreenhouseHomeRoute)).toBe(homeRoute);
  });

  it('rewrites home when GREENHOUSE_PREVIEW=1 on a Vercel preview', async () => {
    process.env.GREENHOUSE_PREVIEW = '1';
    process.env.VERCEL_ENV = 'preview';
    expect(await greenhouseRewritePath(requestFor(homeRoute))).toBe(internalGreenhouseHomeRoute);
  });

  it('rewrites home when GREENHOUSE_PREVIEW=1 locally', async () => {
    process.env.GREENHOUSE_PREVIEW = '1';
    expect(await greenhouseRewritePath(requestFor(homeRoute))).toBe(internalGreenhouseHomeRoute);
  });

  it('does not let GREENHOUSE_PREVIEW rewrite Vercel production', async () => {
    process.env.GREENHOUSE_PREVIEW = '1';
    process.env.VERCEL_ENV = 'production';
    expect(await greenhouseRewritePath(requestFor(homeRoute))).toBeNull();
  });
});
