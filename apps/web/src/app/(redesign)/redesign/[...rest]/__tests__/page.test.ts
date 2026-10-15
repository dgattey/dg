import { redesignRoutePrefix } from '@dg/shared-core/routes/app';
import { publicPathFromRedesign } from '../../../../../redesignRouting';
import CatchAll, { generateStaticParams } from '../page';

describe('redesign catch-all', () => {
  it('gives Cache Components a sample param so the layout prerenders without Suspense', () => {
    expect(generateStaticParams().length).toBeGreaterThan(0);
  });

  it('samples paths the proxy redirects off the internal /redesign prefix', () => {
    for (const { rest } of generateStaticParams()) {
      const internalPath = `${redesignRoutePrefix}/${rest.join('/')}`;
      expect(publicPathFromRedesign(internalPath)).toBe(`/${rest.join('/')}`);
    }
  });

  it('renders the not-found boundary', () => {
    expect(() => CatchAll()).toThrow(
      expect.objectContaining({ digest: expect.stringContaining('404') }),
    );
  });
});
