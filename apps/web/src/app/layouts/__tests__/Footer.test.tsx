/**
 * @jest-environment jsdom
 */

import type { FooterContent } from '@dg/content-models/contentful/renderables/footer';
import type { Track } from '@dg/content-models/spotify/Track';
import type { StravaActivity } from '@dg/content-models/strava/StravaActivity';
import { favoriteAlbumsRoute, homeRoute, musicRoute } from '@dg/shared-core/routes/app';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
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
            value: 'Making software in San Francisco. Say hi anytime.',
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
  { icon: 'github', title: 'Github', url: 'https://github.com/dgattey' },
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
    externalUrls: { spotify: 'https://open.spotify.com/album/solace' },
    href: 'https://api.spotify.com/v1/albums/solace',
    id: 'solace',
    images: [
      {
        height: 300,
        url: 'https://i.scdn.co/image/sample-album',
        width: 300,
      },
    ],
    name: 'Solace',
    releaseDate: '2018-10-19',
    uri: 'spotify:album:solace',
  },
  albumImage: {
    height: 300,
    url: 'https://i.scdn.co/image/sample-album',
    width: 300,
  },
  artists: [
    {
      externalUrls: { spotify: 'https://open.spotify.com/artist/1' },
      href: 'https://api.spotify.com/v1/artists/1',
      id: '1',
      name: 'RÜFÜS DU SOL',
      uri: 'spotify:artist:1',
    },
  ],
  durationMs: 578000,
  externalUrls: { spotify: 'https://open.spotify.com/track/innerbloom' },
  href: 'https://api.spotify.com/v1/tracks/innerbloom',
  id: 'innerbloom',
  isPlaying: true,
  name: 'Innerbloom',
  progressMs: 120000,
  uri: 'spotify:track:innerbloom',
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
    expect(screen.getByText('Playing')).toBeInTheDocument();
    expect(screen.getByText('Innerbloom · RÜFÜS DU SOL')).toBeInTheDocument();
    expect(screen.getByText('Last ride')).toBeInTheDocument();
    expect(screen.getByText('Morning ride · 24.1 mi')).toBeInTheDocument();
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
    expect(screen.getByText('Say hello')).toBeInTheDocument();
    expect(screen.getByText('Elsewhere')).toBeInTheDocument();
    expect(
      screen.getByText('Making software in San Francisco. Say hi anytime.'),
    ).toBeInTheDocument();

    expect(screen.queryByText(/37\.76/)).not.toBeInTheDocument();
    expect(screen.queryByText(/122\.45/)).not.toBeInTheDocument();
    expect(screen.queryByText(/llms\.txt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dev console/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Back to top/i)).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', homeRoute);
    expect(screen.getByRole('link', { name: 'Music' })).toHaveAttribute('href', musicRoute);
    expect(screen.getByRole('link', { name: 'Favorite albums' })).toHaveAttribute(
      'href',
      favoriteAlbumsRoute,
    );
  });

  it('renders Elsewhere compact chips without raw URLs and with X ordered directly after Instagram', async () => {
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
    expect(screen.queryByText('x.com/dyl_gat')).not.toBeInTheDocument();
    expect(screen.queryByText(/strava\.com\/athletes/i)).not.toBeInTheDocument();
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
  });
});
