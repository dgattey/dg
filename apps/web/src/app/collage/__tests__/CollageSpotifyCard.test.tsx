/**
 * @jest-environment jsdom
 */

import type { Track } from '@dg/content-models/spotify/Track';
import { render, screen } from '@testing-library/react';
import { CollageSpotifyCard } from '../CollageSpotifyCard';

jest.mock('../../spotify/AlbumArtWithNotes', () => ({
  AlbumArtWithNotes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../spotify/PlaybackStatus', () => ({
  PlaybackStatus: () => <span>Played recently</span>,
}));

jest.mock('../../spotify/TrackTitle', () => ({
  TrackTitle: ({ trackTitle, url }: { trackTitle: string; url: string }) => (
    <a href={url}>{trackTitle}</a>
  ),
}));

jest.mock('../../spotify/ArtistList', () => ({
  ArtistList: ({ artists }: { artists: Array<{ name: string }> }) => (
    <span>{artists.map((artist) => artist.name).join(', ')}</span>
  ),
}));

jest.mock('../../spotify/PlaybackProgressBar', () => ({
  PlaybackProgressBar: () => <div data-testid="progress-bar" />,
}));

jest.mock('../PaperCard', () => ({
  PaperCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@dg/ui/dependent/Image', () => ({
  Image: ({ alt, url }: { alt: string; url: string }) => (
    <span aria-label={alt} data-src={url} role="img" />
  ),
}));

jest.mock('@dg/ui/dependent/Link', () => ({
  Link: ({
    children,
    href,
    title,
  }: {
    children?: React.ReactNode;
    href: string;
    title?: string;
  }) => (
    <a href={href} title={title}>
      {children}
    </a>
  ),
}));

const track = {
  album: {
    externalUrls: { spotify: 'https://open.spotify.com/album/1' },
    href: '',
    id: 'a',
    images: [],
    name: 'City LP',
    releaseDate: '2026-01-01',
    uri: '',
  },
  albumImage: { height: 640, url: 'https://images.test/cover.jpg', width: 640 },
  artists: [
    {
      externalUrls: { spotify: 'https://open.spotify.com/artist/1' },
      href: '',
      id: 'ar',
      name: 'Big Wild',
      uri: '',
    },
  ],
  durationMs: 200_000,
  externalUrls: { spotify: 'https://open.spotify.com/track/1' },
  href: '',
  id: 't',
  isPlaying: true,
  name: 'City of Sound',
  progressMs: 40_000,
  uri: '',
} satisfies Track;

describe('CollageSpotifyCard', () => {
  it('renders disc art, status, title, artists, and progress', () => {
    const { container } = render(<CollageSpotifyCard track={track} />);

    expect(container.querySelector('[data-work-slot="sp"]')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'City LP' })).toHaveAttribute(
      'data-src',
      'https://images.test/cover.jpg',
    );
    expect(screen.getByText('Played recently')).toBeInTheDocument();
    expect(screen.getByText('City of Sound')).toBeInTheDocument();
    expect(screen.getByText('Big Wild')).toBeInTheDocument();
    expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('link')
        .some(
          (link) =>
            link.getAttribute('href') === 'https://open.spotify.com/track/1' &&
            link.textContent === 'City of Sound',
        ),
    ).toBe(true);
  });
});
