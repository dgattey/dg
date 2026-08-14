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
import { Writable } from 'node:stream';
import { type ReactElement, Suspense, use } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { DEFAULT_FOREST_SEED } from '../forest/forestMap';

jest.mock('next/server', () => ({
  connection: jest.fn().mockResolvedValue(undefined),
}));

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

/** Everything the server streams, hidden Suspense payloads and all. */
const streamedHtml = (element: ReactElement, abortAfterMs?: number): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Array<Buffer> = [];
    const sink = new Writable({
      write(chunk, _encoding, done) {
        chunks.push(Buffer.from(chunk));
        done();
      },
    });
    sink.on('finish', () => {
      resolve(Buffer.concat(chunks).toString('utf8'));
    });
    sink.on('error', reject);

    const { pipe, abort } = renderToPipeableStream(element, {
      // An aborted boundary reports here; that is the point of the first test.
      onError() {},
      onShellError: reject,
      onShellReady() {
        pipe(sink);
      },
    });
    if (abortAfterMs !== undefined) {
      setTimeout(abort, abortAfterMs);
    }
  });

/** The markup a browser paints before it runs anything. */
async function noScriptShell(element: ReactElement, abortAfterMs?: number): Promise<string> {
  const html = await streamedHtml(element, abortAfterMs);
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
    // never sees, and that truncating is what makes the difference.
    // A fresh promise each time: a settled one never suspends, so reusing the
    // tree would quietly stop testing anything.
    const tree = () => {
      const slow = new Promise<void>((resolve) => {
        setTimeout(resolve, 50);
      });
      const Late = () => {
        use(slow);
        return <p>only with scripts</p>;
      };
      return (
        <div>
          <p>in the shell</p>
          <Suspense fallback={<p>loading</p>}>
            <Late />
          </Suspense>
        </div>
      );
    };

    // The boundary does resolve, so the full stream carries its markup — this
    // is exactly the false pass that asserting on unsliced HTML would give.
    expect(visibleText(await streamedHtml(tree()))).toContain('only with scripts');

    const shell = await noScriptShell(tree());
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
    const shell = await noScriptShell(await ForestHomepage({ seed: DEFAULT_FOREST_SEED }));

    // The world itself, not just a wash: a terrain bitmap and carved boards.
    expect(shell).toContain('data-forest-world');
    expect(shell).toContain('data:image/png;base64,');
    expect(shell).toContain('data-forest-landmark');
    expect(shell).toContain('data-forest-minimap');
    expect(visibleText(shell)).toContain('Alpha Project');
    for (const caption of [
      'Meadow camp',
      'Wetland boardwalk',
      'Mountain overlook',
      'Forest grove',
      'Rocky shore',
      'Lakeside',
    ]) {
      expect(shell).not.toContain(caption);
    }

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
