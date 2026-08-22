import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { NowPlayingCard } from '../NowPlayingCard';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

const TEST_SERVER_TIME = new Date('2026-02-10T12:00:00Z').getTime();

function TestWrapper({ children }: { children: ReactNode }) {
  return (
    <div data-greenhouse-frame={true}>
      <ServerTimeProvider serverTime={TEST_SERVER_TIME}>{children}</ServerTimeProvider>
    </div>
  );
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
    expect(document.querySelector('[data-now-playing-progress]')).toBeTruthy();
  });

  it('paints watercolor leaves instead of line-art botanical strokes', () => {
    const { container } = render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    expect(container.querySelector('[data-watercolor-leaves]')).toBeTruthy();
    expect(container.querySelector('[data-now-playing-wash]')).toBeTruthy();
    expect(container.querySelectorAll('[data-watercolor-leaf]').length).toBeGreaterThanOrEqual(20);
    expect(container.querySelector('[data-now-playing-copy]')).toBeTruthy();
    expect(container.querySelector('[data-now-playing-leaf]')).toBeTruthy();
  });

  it('keeps cream resting notes when playback is idle', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={{ ...track, isPlaying: false }} />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-resting-notes]')).toBeTruthy();
    expect(document.querySelector('[data-music-notes]')).toBeNull();
  });

  it('uses the card note scatter while a track is playing', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-music-notes="card"]')).toBeTruthy();
  });

  it('does not print playback timestamps on the home card', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    expect(screen.queryByText(/:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/2:47/)).not.toBeInTheDocument();
  });

  it('clamps the title to two wrapping lines and the artist to one', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const title = screen.getByText('Leaflight');
    const titleCss = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .filter((rule) => [...title.classList].some((className) => rule.includes(`.${className}`)))
      .join('\n');
    expect(titleCss).toContain('-webkit-line-clamp: 2');
    expect(titleCss).toContain('overflow-wrap: anywhere');

    const artist = document.querySelector('[data-now-playing-artist] .MuiTypography-root');
    expect(artist).toBeTruthy();
    const artistCss = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .filter((rule) =>
        [...(artist?.classList ?? [])].some((className) => rule.includes(`.${className}`)),
      )
      .join('\n');
    expect(artistCss).toContain('-webkit-line-clamp: 1');
  });

  it('names a card container and steps the title down inside it', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const card = document.querySelector('[data-bento="now-playing"]');
    expect(card).toHaveStyle({
      containerName: 'now-playing',
      containerType: 'inline-size',
    });

    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');
    expect(css).toContain('@container now-playing (max-width: 25.5rem)');
    expect(css).toContain('font-size: 1.75rem');
    expect(css).toContain('font-size: 1.5rem');
    expect(css).not.toContain('1.35rem + 0.55vw');
  });

  it('uses a medium title weight and a soft copy scrim instead of a left panel', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');

    expect(document.querySelector('[data-now-playing-scrim]')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-grain]')).toBeTruthy();
    expect(css).toContain('font-weight: 500');
    expect(css).toContain('rgba(40, 55, 35, 0.55)');
    expect(css).toContain('#e7d48a');
    expect(css).not.toContain('#3f522c');
    expect(css).not.toContain('ellipse 58% 52% at 94% 8%');
  });
});
