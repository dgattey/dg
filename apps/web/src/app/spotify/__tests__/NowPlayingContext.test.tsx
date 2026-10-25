import type { Track } from '@dg/content-models/spotify/Track';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { act, render, screen, waitFor } from '@testing-library/react';
import { loadLatestSong } from '../../../services/spotify.actions';
import { FooterNowStrip } from '../../layouts/FooterNowStrip';
import { NowPlayingProvider } from '../NowPlayingContext';
import { SpotifyCollageCard } from '../SpotifyCollageCard';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../../../services/spotify.actions', () => ({
  loadLatestSong: jest.fn(async () => null),
}));

jest.mock('../TrackListing', () => ({
  TrackListing: ({ track, variant = 'card' }: { track: Track; variant?: string }) => (
    <div data-testid={variant}>{track.name}</div>
  ),
}));

const makeTrack = (id: string, overrides: Partial<Track> = {}): Track => {
  const core = {
    id,
    name: `Track ${id}`,
    url: `https://open.spotify.com/${id}`,
  };
  return {
    ...core,
    album: { ...core, name: `Album ${id}`, releaseDate: '2026-01-01' },
    albumImage: { height: 640, url: `https://i.scdn.co/image/${id}.jpg`, width: 640 },
    artists: [{ ...core, id: `artist-${id}`, name: `Artist ${id}` }],
    isPlaying: true,
    ...overrides,
  };
};

const STALE = makeTrack('stale');
const FRESH = makeTrack('fresh');
const NEXT_PLAYING = makeTrack('next');

beforeEach(() => {
  mockPathname = '/';
  window.sessionStorage.clear();
  jest.mocked(loadLatestSong).mockReset().mockResolvedValue(null);
});

describe('NowPlayingProvider', () => {
  it('fetches the live track on mount and updates header, homepage card, and footer strip', async () => {
    jest.mocked(loadLatestSong).mockResolvedValueOnce(FRESH);

    render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
      expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
      expect(
        screen.getByRole('link', { name: 'Now playing Track fresh · Artist fresh' }),
      ).toHaveAttribute('href', 'https://open.spotify.com/fresh');
    });
  });

  it('restores the sessionStorage track synchronously on refresh before the network poll resolves', async () => {
    window.sessionStorage.setItem(
      'dg:now-playing',
      JSON.stringify({ savedAt: Date.now(), track: FRESH }),
    );
    let resolvePoll: ((value: Track | null) => void) | undefined;
    jest.mocked(loadLatestSong).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePoll = resolve;
        }),
    );

    render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
    expect(
      screen.getByRole('link', { name: 'Now playing Track fresh · Artist fresh' }),
    ).toBeInTheDocument();

    act(() => {
      resolvePoll?.(NEXT_PLAYING);
    });

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track next');
      expect(screen.getByTestId('card')).toHaveTextContent('Track next');
      expect(
        screen.getByRole('link', { name: 'Now playing Track next · Artist next' }),
      ).toBeInTheDocument();
    });
  });

  it('keeps the header on its own track outside the provider', () => {
    render(<SpotifyHeaderCard track={STALE} />);

    expect(screen.getByTestId('compact')).toHaveTextContent('Track stale');
  });

  it('switches the shell track to the live one without the shell overwriting it', async () => {
    jest.mocked(loadLatestSong).mockResolvedValueOnce(FRESH);

    const { rerender } = render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={STALE} />
      </NowPlayingProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    });

    rerender(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={{ ...STALE }} />
      </NowPlayingProvider>,
    );
    expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
  });

  it('shows the live track across header, home card, and footer strip when the shell had none', async () => {
    jest.mocked(loadLatestSong).mockResolvedValueOnce(FRESH);

    render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={null} />
          <SpotifyCollageCard track={null} />
          <FooterNowStrip initialTrack={null} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
      expect(screen.getByTestId('card')).toHaveTextContent('Track fresh');
      expect(
        screen.getByRole('link', { name: 'Now playing Track fresh · Artist fresh' }),
      ).toBeInTheDocument();
    });
  });

  it('renders nothing without any track', () => {
    render(
      <NowPlayingProvider>
        <SpotifyHeaderCard track={null} />
      </NowPlayingProvider>,
    );
    expect(screen.queryByTestId('compact')).not.toBeInTheDocument();
  });

  it('throttles rapid route changes within 5s and refreshes on route navigation or focus after cooldown', async () => {
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_760_000_000_000);
    const THIRD = makeTrack('third');
    jest
      .mocked(loadLatestSong)
      .mockResolvedValueOnce(FRESH)
      .mockResolvedValueOnce(NEXT_PLAYING)
      .mockResolvedValueOnce(THIRD);

    const { rerender } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track fresh');
    });
    expect(loadLatestSong).toHaveBeenCalledTimes(1);

    mockPathname = '/reading';
    rerender(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );
    expect(loadLatestSong).toHaveBeenCalledTimes(1);

    nowSpy.mockReturnValue(1_760_000_006_000);
    mockPathname = '/music';
    rerender(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <NowPlayingProvider>
          <SpotifyHeaderCard track={STALE} />
          <SpotifyCollageCard track={STALE} />
          <FooterNowStrip initialTrack={STALE} latestActivity={null} />
        </NowPlayingProvider>
      </ServerTimeProvider>,
    );
    expect(loadLatestSong).toHaveBeenCalledTimes(2);

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track next');
      expect(screen.getByTestId('card')).toHaveTextContent('Track next');
      expect(
        screen.getByRole('link', { name: 'Now playing Track next · Artist next' }),
      ).toBeInTheDocument();
    });

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(loadLatestSong).toHaveBeenCalledTimes(2);

    nowSpy.mockReturnValue(1_760_000_015_000);
    act(() => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(loadLatestSong).toHaveBeenCalledTimes(3);

    await waitFor(() => {
      expect(screen.getByTestId('compact')).toHaveTextContent('Track third');
      expect(screen.getByTestId('card')).toHaveTextContent('Track third');
      expect(
        screen.getByRole('link', { name: 'Now playing Track third · Artist third' }),
      ).toBeInTheDocument();
    });

    nowSpy.mockRestore();
  });
});
