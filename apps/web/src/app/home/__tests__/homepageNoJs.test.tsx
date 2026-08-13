/**
 * @jest-environment node
 */

/**
 * Guards the no-JS homepage.
 *
 * Both homepage layouts must land in the server-rendered shell, not behind a
 * Suspense boundary. React fills a resolved boundary by writing markup into a
 * hidden container and swapping it in with an inline script, so anything that
 * only arrives that way is invisible with scripting disabled. Truncating at the
 * first `<script>` is what makes these assertions honest: the full streamed
 * markup contains those hidden payloads, so asserting against it passes even
 * when a no-JS visitor would see nothing.
 *
 * This broke once already, for the grid as much as the world, when the layout
 * was chosen by a request-time flag read inside the page. The proxy picks the
 * route now; these tests keep each route's own output honest.
 */
import { type ReactElement, Suspense, use } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';

jest.mock('../../../services/contentful', () => ({
  getIntroContent: async () => null,
  getProjects: async () => [
    {
      layout: 'wide',
      link: { title: 'Alpha', url: 'https://example.com/alpha' },
      thumbnail: { height: 100, title: 'Alpha', url: 'https://example.com/alpha.webp', width: 100 },
      title: 'Alpha Project',
    },
    {
      layout: 'tall',
      link: { title: 'Beta', url: 'https://example.com/beta' },
      thumbnail: { height: 100, title: 'Beta', url: 'https://example.com/beta.webp', width: 100 },
      title: 'Beta Project',
    },
  ],
}));

// The data-backed slots have their own tests; stub them so this one is about
// where the layout lands in the HTML, not about Contentful, Spotify or Strava.
const stub = (testId: string, href: string) => () => (
  <a data-testid={testId} href={href}>
    {testId}
  </a>
);
jest.mock('../IntroCardSlot', () => ({
  IntroCardSlot: stub('intro', 'https://example.com/intro'),
}));
jest.mock('../MapCardSlot', () => ({ MapCardSlot: stub('map', 'https://example.com/map') }));
jest.mock('../StravaCardSlot', () => ({
  StravaCardSlot: stub('strava', 'https://example.com/strava'),
}));
jest.mock('../GatteySitesCardSlot', () => ({
  GatteySitesCardSlot: stub('sites', 'https://example.com/sites'),
}));
jest.mock('../SpotifyCard', () => ({
  SpotifyCardSlot: stub('spotify', 'https://example.com/spotify'),
}));
jest.mock('../forest/ForestIntroSlots', () => ({
  ForestIntroImageSlot: stub('intro-image', 'https://example.com/intro-image'),
  ForestIntroTextSlot: stub('intro-text', 'https://example.com/intro-text'),
}));

/** The markup a browser paints before it runs anything. */
async function noScriptShell(element: ReactElement, signal?: AbortSignal): Promise<string> {
  const { prelude } = await prerenderToNodeStream(element, { signal });
  const chunks: Array<Buffer> = [];
  for await (const chunk of prelude) {
    chunks.push(Buffer.from(chunk));
  }
  const html = Buffer.concat(chunks).toString('utf8');
  const firstScript = html.indexOf('<script');
  return firstScript === -1 ? html : html.slice(0, firstScript);
}

/** Text a reader would actually see — stylesheets are markup, not content. */
const visibleText = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hrefsIn = (html: string) => [...html.matchAll(/href="([^"]+)"/g)].map(([, href]) => href);

describe('homepage without scripting', () => {
  it('does not count content that only arrives behind a boundary', async () => {
    // Proves the two assertions below cannot pass on markup a no-JS visitor
    // never sees. Content inside an unresolved boundary is exactly what the
    // old homepage shipped, and it must not show up in the shell.
    const never = new Promise<void>(() => {});
    const Pending = () => {
      use(never);
      return null;
    };
    const controller = new AbortController();
    setTimeout(() => {
      controller.abort();
    }, 100);
    const shell = await noScriptShell(
      <div>
        <p>in the shell</p>
        <Suspense fallback={<p>loading</p>}>
          <Pending />
          {/* Reachable, but only ever through the inline script that swaps a
              resolved boundary into place — so never for a no-JS visitor. */}
          <p>only with scripts</p>
        </Suspense>
      </div>,
      controller.signal,
    );

    expect(visibleText(shell)).toContain('in the shell');
    expect(visibleText(shell)).toContain('loading');
    expect(visibleText(shell)).not.toContain('only with scripts');
  });

  it('serves the card grid in the shell', async () => {
    const { Homepage } = await import('../Homepage');
    const shell = await noScriptShell(await Homepage());

    expect(visibleText(shell)).toContain('Alpha Project');
    expect(visibleText(shell)).toContain('Beta Project');
    expect(hrefsIn(shell)).toEqual(
      expect.arrayContaining([
        'https://example.com/alpha',
        'https://example.com/beta',
        'https://example.com/intro',
        'https://example.com/map',
        'https://example.com/spotify',
      ]),
    );
  });

  it('serves the island in the shell', async () => {
    const { ForestHomepage } = await import('../forest/ForestHomepage');
    const shell = await noScriptShell(await ForestHomepage());

    // The world itself, not just a wash: terrain tiles and carved boards.
    expect(shell).toContain('data-forest-world');
    expect(shell.match(/<rect/g)?.length ?? 0).toBeGreaterThan(100);
    expect(visibleText(shell)).toContain('Alpha Project');

    // Every card the grid has is reachable here too.
    expect(hrefsIn(shell)).toEqual(
      expect.arrayContaining([
        'https://example.com/alpha',
        'https://example.com/beta',
        'https://example.com/intro-text',
        'https://example.com/map',
        'https://example.com/spotify',
      ]),
    );
  });
});
