/**
 * @jest-environment jsdom
 */

import type { FooterContent } from '@dg/content-models/contentful/renderables/footer';
import type { Track } from '@dg/content-models/spotify/Track';
import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import {
  activitiesRoute,
  changelogRoute,
  favoriteAlbumsRoute,
  homeRoute,
  musicRoute,
  musicStatsRoute,
  readingRoute,
  siteMapRoute,
} from '@dg/shared-core/routes/app';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('../../../services/contentful', () => ({
  getFooterContent: jest.fn(
    async (): Promise<FooterContent> => ({
      description: null,
      links: [],
    }),
  ),
}));

jest.mock('../../../services/spotify', () => ({
  getLastKnownSong: jest.fn(async (): Promise<Track | null> => null),
}));

jest.mock('../../../services/strava', () => ({
  getLatestActivity: jest.fn(async (): Promise<StravaActivity | null> => null),
}));

jest.mock('../../../services/version', () => ({
  getAppVersionInfo: jest.fn(async () => ({
    releaseUrl: 'https://github.com/dgattey/dg/releases/tag/v2.72.0',
    version: 'v2.72.0',
  })),
}));

jest.mock('next/cache', () => ({
  cacheLife: jest.fn(),
}));

import { getFooterContent } from '../../../services/contentful';
import { getLastKnownSong } from '../../../services/spotify';
import { getLatestActivity } from '../../../services/strava';
import { Footer } from '../Footer';

const mockGetFooterContent = getFooterContent as jest.MockedFunction<typeof getFooterContent>;
const mockGetLastKnownSong = getLastKnownSong as jest.MockedFunction<typeof getLastKnownSong>;
const mockGetLatestActivity = getLatestActivity as jest.MockedFunction<typeof getLatestActivity>;

const SAMPLE_DESCRIPTION: FooterContent['description'] = {
  json: {
    content: [
      {
        content: [
          {
            data: {},
            marks: [],
            nodeType: 'text',
            value:
              'Building from San Francisco. Always happy to connect about product, craft, and the outdoors!',
          },
        ],
        data: {},
        nodeType: 'paragraph',
      },
    ],
    data: {},
    nodeType: 'document',
  },
  links: {
    assets: { block: [] },
    entries: { block: [], inline: [] },
  },
};

const SAMPLE_LINKS: FooterContent['links'] = [
  { icon: 'cursor', title: 'Cursor', url: 'https://cursor.com/@dyl' },
  { icon: 'github', title: 'GitHub', url: 'https://github.com/dgattey' },
  { icon: 'strava', title: 'Strava', url: 'https://www.strava.com/athletes/17469310' },
  {
    icon: 'spotify',
    title: 'Spotify',
    url: 'https://open.spotify.com/user/dylangattey?si=yXvHMsSLR9au8bTjdjJsUA',
  },
  { icon: 'instagram', title: 'Instagram', url: 'https://www.instagram.com/dylangattey' },
  { icon: 'x', title: 'X', url: 'https://x.com/dyl_gat' },
  { icon: 'linkedin', title: 'LinkedIn', url: 'https://www.linkedin.com/in/dgattey' },
  { icon: 'email', title: 'Email me', url: 'mailto:dylan@gattey.com' },
];

const SAMPLE_TRACK: Track = {
  album: {
    id: 'solace',
    name: 'Solace',
    releaseDate: '2018-10-19',
    url: 'https://open.spotify.com/album/solace',
  },
  albumImage: {
    height: 300,
    url: 'https://i.scdn.co/image/sample-album',
    width: 300,
  },
  artists: [
    {
      id: '1',
      name: 'RÜFÜS DU SOL',
      url: 'https://open.spotify.com/artist/1',
    },
  ],
  durationMs: 578000,
  id: 'innerbloom',
  isPlaying: true,
  name: 'Innerbloom',
  progressMs: 120000,
  url: 'https://open.spotify.com/track/innerbloom',
};

const SAMPLE_ACTIVITY: StravaActivity = {
  distance: 38785.2,
  elapsedTime: 4800,
  endLatlng: [37.77, -122.42],
  id: 12345,
  maxSpeed: 12,
  movingTime: 4500,
  name: 'Morning ride',
  sportType: 'Ride',
  startDate: '2026-10-19T15:00:00Z',
  startLatlng: [37.76, -122.45],
  totalElevationGain: 450,
  type: 'Ride',
  url: 'https://www.strava.com/activities/12345',
};

describe('Footer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders sentence-case labels, Contentful description, and Now strip without coordinates, llms.txt, or Dev console', async () => {
    mockGetFooterContent.mockResolvedValue({
      description: SAMPLE_DESCRIPTION,
      links: SAMPLE_LINKS,
    });
    mockGetLastKnownSong.mockResolvedValue(SAMPLE_TRACK);
    mockGetLatestActivity.mockResolvedValue(SAMPLE_ACTIVITY);

    const ui = await Footer();
    render(<ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>);

    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Now playing Innerbloom · RÜFÜS DU SOL' }),
    ).toHaveAttribute('href', 'https://open.spotify.com/track/innerbloom');
    expect(screen.getByRole('link', { name: 'Last ride Morning ride · 24.1 mi' })).toHaveAttribute(
      'href',
      'https://www.strava.com/activities/12345',
    );
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('Say hello')).toBeInTheDocument();
    expect(screen.getByText('Elsewhere')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Building from San Francisco. Always happy to connect about product, craft, and the outdoors!',
      ),
    ).toBeInTheDocument();

    expect(screen.queryByText(/37\.76/)).not.toBeInTheDocument();
    expect(screen.queryByText(/122\.45/)).not.toBeInTheDocument();
    expect(screen.queryByText(/llms\.txt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dev console/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Back to top/i)).not.toBeInTheDocument();

    const versionLink = screen.getByRole('link', { name: 'v2.72.0' });
    expect(versionLink).toHaveAttribute('href', changelogRoute);
    const siteMapLink = screen.getByRole('link', { name: 'Site map' });
    expect(siteMapLink).toHaveAttribute('href', siteMapRoute);
    expect(
      versionLink.compareDocumentPosition(siteMapLink) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const footerNav = screen.getByRole('navigation', { name: 'Footer navigation' });
    expect(
      within(footerNav)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Home', homeRoute],
      ['Listening stats', musicStatsRoute],
      ['Plays', musicRoute],
      ['Favorite albums', favoriteAlbumsRoute],
      ['Reads', readingRoute],
      ['Big map', activitiesRoute],
    ]);
  });

  it('omits the description paragraph and email action when Contentful returns neither', async () => {
    mockGetFooterContent.mockResolvedValue({
      description: null,
      links: [],
    });

    const ui = await Footer();
    render(<ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>);

    expect(screen.queryByText(/Building from San Francisco/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy email address' })).not.toBeInTheDocument();
  });

  it('renders Contentful section titles, column order, and Now strip outside .chrome__footer so it straddles the sheet edge', async () => {
    mockGetFooterContent.mockResolvedValue({
      description: SAMPLE_DESCRIPTION,
      elsewhereTitle: 'Follow along',
      helloTitle: 'Get in touch',
      links: SAMPLE_LINKS,
      sectionOrder: ['elsewhere', 'hello'],
    });
    mockGetLastKnownSong.mockResolvedValue(SAMPLE_TRACK);

    const ui = await Footer();
    const { container } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>,
    );

    const followTag = screen.getByText('Follow along');
    const touchTag = screen.getByText('Get in touch');
    expect(
      followTag.compareDocumentPosition(touchTag) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const nowWrap = container.querySelector('.chrome__nowWrap');
    const footerEl = container.querySelector('footer.chrome__footer');
    expect(nowWrap).not.toBeNull();
    expect(footerEl).not.toBeNull();
    expect(footerEl?.contains(nowWrap)).toBe(false);
  });

  it('labels a finished track with when it played, matching the header and card', async () => {
    mockGetLastKnownSong.mockResolvedValue({
      ...SAMPLE_TRACK,
      isPlaying: false,
      playedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    });

    const ui = await Footer();
    render(<ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>);

    expect(
      screen.getByRole('link', { name: 'Played 3 hours ago Innerbloom · RÜFÜS DU SOL' }),
    ).toBeInTheDocument();
  });

  it('shows the full track in a tooltip only when the strip cuts it off', async () => {
    const user = userEvent.setup();
    mockGetLastKnownSong.mockResolvedValue({
      ...SAMPLE_TRACK,
      name: 'Together (feat. Nikki Nair, Jessy Lanza & Prentiss)',
    });
    mockGetLatestActivity.mockResolvedValue(SAMPLE_ACTIVITY);

    const ui = await Footer();
    render(<ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>);

    const summary = 'Together (feat. Nikki Nair, Jessy Lanza & Prentiss) · RÜFÜS DU SOL';
    const trackLink = screen.getByRole('link', { name: `Now playing ${summary}` });
    const anchor = trackLink.parentElement;
    const value = within(trackLink).getByText(summary);
    if (!anchor) {
      throw new Error('Track tooltip anchor not found');
    }
    expect(within(anchor).getByRole('tooltip', { hidden: true })).toHaveTextContent(summary);

    await user.hover(anchor);
    expect(anchor).toHaveAttribute('data-tooltip-muted');

    value.style.overflow = 'hidden';
    Object.defineProperty(value, 'clientWidth', { configurable: true, value: 180 });
    Object.defineProperty(value, 'scrollWidth', { configurable: true, value: 420 });
    await user.unhover(anchor);
    await user.hover(anchor);
    expect(anchor).not.toHaveAttribute('data-tooltip-muted');
  });

  it('renders Elsewhere stacked ledger rows with formatted handles and X ordered directly after Instagram', async () => {
    mockGetFooterContent.mockResolvedValue({
      description: SAMPLE_DESCRIPTION,
      links: SAMPLE_LINKS,
    });

    const ui = await Footer();
    render(<ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>);

    const cursor = screen.getByRole('link', { name: 'Cursor' });
    const github = screen.getByRole('link', { name: 'GitHub' });
    const strava = screen.getByRole('link', { name: 'Strava' });
    const spotify = screen.getByRole('link', { name: 'Spotify' });
    const instagram = screen.getByRole('link', { name: 'Instagram' });
    const xLink = screen.getByRole('link', { name: 'X' });
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' });

    expect(cursor).toHaveAttribute('href', 'https://cursor.com/@dyl');
    expect(github).toHaveAttribute('href', 'https://github.com/dgattey');
    expect(strava).toHaveAttribute('href', 'https://www.strava.com/athletes/17469310');
    expect(spotify).toHaveAttribute(
      'href',
      'https://open.spotify.com/user/dylangattey?si=yXvHMsSLR9au8bTjdjJsUA',
    );
    expect(instagram).toHaveAttribute('href', 'https://www.instagram.com/dylangattey');
    expect(xLink).toHaveAttribute('href', 'https://x.com/dyl_gat');
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/dgattey');

    expect(
      instagram.compareDocumentPosition(xLink) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(xLink.compareDocumentPosition(linkedin) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('cursor.com/@dyl')).toBeInTheDocument();
    expect(screen.getByText('github.com/dgattey')).toBeInTheDocument();
    expect(screen.getByText('strava.com/athletes/17469310')).toBeInTheDocument();
    expect(screen.getByText('open.spotify.com/user/dylangattey')).toBeInTheDocument();
    expect(screen.getByText('instagram.com/dylangattey')).toBeInTheDocument();
    expect(screen.getByText('x.com/dyl_gat')).toBeInTheDocument();
    expect(screen.getByText('linkedin.com/in/dgattey')).toBeInTheDocument();
  });

  it('obfuscates the email in static SSR HTML and decodes on client for mailto and copy', async () => {
    mockGetFooterContent.mockResolvedValue({
      description: SAMPLE_DESCRIPTION,
      links: SAMPLE_LINKS,
    });

    const ui = await Footer();
    const ssrHtml = renderToStaticMarkup(
      <ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>,
    );
    expect(ssrHtml).not.toContain('dylan@gattey.com');
    expect(ssrHtml).not.toContain('mailto:');

    const user = userEvent.setup();
    const writeText = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
    render(<ServerTimeProvider serverTime={1_760_000_000_000}>{ui}</ServerTimeProvider>);

    const emailLink = await screen.findByRole('link', { name: 'Email dylan@gattey.com' });
    expect(emailLink).toHaveAttribute('href', 'mailto:dylan@gattey.com');
    expect(emailLink).toHaveTextContent('dylan@gattey.com');

    const copyButton = screen.getByRole('button', { name: 'Copy email address' });
    expect(copyButton).toHaveTextContent('Copy');
    await user.click(copyButton);
    expect(writeText).toHaveBeenCalledWith('dylan@gattey.com');
    expect(copyButton).toHaveTextContent('Copied');
    expect(copyButton.querySelector('svg')).not.toBeNull();
  });

  it('keeps --footer-progress at 0 above the footer and interpolates to 1 as the footer scrolls into view', async () => {
    mockGetFooterContent.mockResolvedValue({
      description: SAMPLE_DESCRIPTION,
      links: SAMPLE_LINKS,
    });

    const ui = await Footer();
    const { container } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <div className="collageSheet">main content</div>
        {ui}
      </ServerTimeProvider>,
    );

    const sheet = container.querySelector<HTMLElement>('.collageSheet');
    const footer = container.querySelector<HTMLElement>('.chrome__footer');
    expect(sheet).not.toBeNull();
    expect(footer).not.toBeNull();

    Object.defineProperty(footer, 'offsetHeight', { configurable: true, value: 400 });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2400,
    });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });

    window.dispatchEvent(new Event('scroll'));
    expect(sheet?.style.getPropertyValue('--footer-progress')).toBe('0');

    window.scrollY = 1100;
    window.dispatchEvent(new Event('scroll'));
    expect(sheet?.style.getPropertyValue('--footer-progress')).toBe('0.0000');

    window.scrollY = 1300;
    window.dispatchEvent(new Event('scroll'));
    expect(sheet?.style.getPropertyValue('--footer-progress')).toBe('0.5000');

    window.scrollY = 1500;
    window.dispatchEvent(new Event('scroll'));
    expect(sheet?.style.getPropertyValue('--footer-progress')).toBe('1.0000');
  });

  it('applies the same scroll-driven --footer-progress reveal on .collageSheet.collageField pages', async () => {
    mockGetFooterContent.mockResolvedValue({
      description: SAMPLE_DESCRIPTION,
      links: SAMPLE_LINKS,
    });

    const ui = await Footer();
    const { container } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <div className="collageRoot">
          <div className="collageSheet collageField">music page content</div>
          {ui}
        </div>
      </ServerTimeProvider>,
    );

    const sheet = container.querySelector<HTMLElement>('.collageSheet');
    const footer = container.querySelector<HTMLElement>('.chrome__footer');
    expect(sheet).not.toBeNull();
    expect(footer).not.toBeNull();

    Object.defineProperty(footer, 'offsetHeight', { configurable: true, value: 400 });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2400,
    });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1300, writable: true });

    window.dispatchEvent(new Event('scroll'));
    expect(sheet?.style.getPropertyValue('--footer-progress')).toBe('0.5000');

    window.scrollY = 1500;
    window.dispatchEvent(new Event('scroll'));
    expect(sheet?.style.getPropertyValue('--footer-progress')).toBe('1.0000');
  });

  it('continues shrinking the sheet even when prefers-reduced-motion is reduce', async () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query: string) => ({
      addEventListener: jest.fn(),
      addListener: jest.fn(),
      dispatchEvent: jest.fn(),
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      removeEventListener: jest.fn(),
      removeListener: jest.fn(),
    }));

    try {
      mockGetFooterContent.mockResolvedValue({
        description: SAMPLE_DESCRIPTION,
        links: SAMPLE_LINKS,
      });

      const ui = await Footer();
      const { container } = render(
        <ServerTimeProvider serverTime={1_760_000_000_000}>
          <div className="collageRoot">
            <div className="collageSheet">page content with backdrop</div>
            {ui}
          </div>
        </ServerTimeProvider>,
      );

      const sheet = container.querySelector<HTMLElement>('.collageSheet');
      const footer = container.querySelector<HTMLElement>('.chrome__footer');
      expect(sheet).not.toBeNull();
      expect(footer).not.toBeNull();

      Object.defineProperty(footer, 'offsetHeight', { configurable: true, value: 400 });
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        configurable: true,
        value: 2400,
      });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: 900 });
      Object.defineProperty(window, 'scrollY', { configurable: true, value: 1500, writable: true });

      window.dispatchEvent(new Event('scroll'));
      expect(sheet?.style.getPropertyValue('--footer-progress')).toBe('1.0000');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
