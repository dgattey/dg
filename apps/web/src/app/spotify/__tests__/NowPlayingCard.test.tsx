import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { NowPlayingCard } from '../NowPlayingCard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const TEST_SERVER_TIME = new Date('2026-02-10T12:00:00Z').getTime();

function TestWrapper({ children }: { children: ReactNode }) {
  return <ServerTimeProvider serverTime={TEST_SERVER_TIME}>{children}</ServerTimeProvider>;
}

const artist = {
  externalUrls: { spotify: 'https://open.spotify.com/artist/a' },
  href: 'https://api.spotify.com/artist/a',
  id: 'a',
  name: 'Alder & Moss',
  uri: 'spotify:artist:a',
};

const track = {
  ...artist,
  album: {
    ...artist,
    images: [{ height: 64, url: '/art.jpg', width: 64 }],
    name: 'Glasshouse',
    releaseDate: '2026-01-01',
  },
  albumGradient: 'linear-gradient(white, gold)',
  albumGradientContrastSetting: 'light' as const,
  albumImage: { height: 64, url: '/art.jpg', width: 64 },
  artists: [artist],
  durationMs: 200000,
  id: 't',
  isPlaying: true,
  name: 'Leaflight',
  progressMs: 50000,
  uri: 'spotify:track:t',
};

describe('NowPlayingCard', () => {
  it('shows now playing copy, track, artist, and progress', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
    expect(screen.getByText('Leaflight')).toBeInTheDocument();
    expect(screen.getByText('Alder & Moss')).toBeInTheDocument();
  });
});
