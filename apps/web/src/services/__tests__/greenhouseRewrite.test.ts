import { homeRoute, internalGreenhouseHomeRoute } from '@dg/shared-core/routes/app';
import { NextRequest } from 'next/server';
import { greenhouseRewritePath, publicPathForInternalGreenhouse } from '../greenhouseRewrite';

const mockInteractiveRedesign = jest.fn<Promise<boolean>, [unknown]>();

jest.mock('../../flags', () => ({
  interactiveRedesign: (request: unknown) => mockInteractiveRedesign(request),
}));

const requestFor = (path: string) => new NextRequest(`https://example.com${path}`);

describe('greenhouseRewrite', () => {
  beforeEach(() => {
    mockInteractiveRedesign.mockResolvedValue(false);
    delete process.env.GREENHOUSE_PREVIEW;
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
});
