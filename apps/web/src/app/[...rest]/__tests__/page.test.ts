import CatchAll, { generateStaticParams } from '../page';

describe('catch-all not-found route', () => {
  it('gives Cache Components a sample param so the layout prerenders without Suspense', () => {
    expect(generateStaticParams().length).toBeGreaterThan(0);
  });

  it('renders the not-found boundary', () => {
    expect(() => CatchAll()).toThrow(
      expect.objectContaining({ digest: expect.stringContaining('404') }),
    );
  });
});
