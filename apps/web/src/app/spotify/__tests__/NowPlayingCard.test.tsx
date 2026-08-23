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
    expect(screen.getAllByText('Leaflight').length).toBe(3);
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
    expect(container.querySelector('[data-watercolor-blooms]')).toBeTruthy();
    expect(container.querySelector('[data-now-playing-wash]')).toBeTruthy();
    const leaves = container.querySelectorAll('[data-watercolor-leaf]');
    expect(leaves.length).toBeGreaterThanOrEqual(20);
    expect(leaves.length).toBeLessThan(40);
    expect(container.querySelector('[data-now-playing-copy]')).toBeTruthy();
    expect(container.querySelector('[data-now-playing-art]')).toBeTruthy();
    expect(container.querySelector('[data-now-playing-leaf]')).toBeTruthy();
  });

  it('shows the album cover next to the copy with a 2x sizes hint', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const art = document.querySelector('[data-now-playing-art] img');
    expect(art).toBeTruthy();
    expect(art).toHaveAttribute('alt', 'Glasshouse');
    expect(art?.getAttribute('src') ?? '').toContain('art.jpg');
    expect(art?.getAttribute('sizes') ?? '').toContain('160px');
  });

  it('lets the sprig span the full card so leaves are not boxed on the right', () => {
    const { container } = render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const layer = container.querySelector('[data-watercolor-leaves]');
    expect(layer).toHaveStyle({ inset: '0', overflow: 'visible', position: 'absolute' });

    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');
    expect(css).not.toContain('width: 72%');
    expect(css).toContain('rgb(231 212 138 / 0.55)');
    expect(css).toContain('rgb(138 154 91 / 0.32)');
    expect(css).toContain('blur(40px)');
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

    const titles = screen.getAllByText('Leaflight');
    expect(titles[0]).toHaveClass('MuiTypography-h3');
    expect(titles[1]).toHaveClass('MuiTypography-h4');
    expect(titles[2]).toHaveClass('MuiTypography-h5');
    const titleCss = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .filter((rule) =>
        titles.some((title) =>
          [...title.classList].some((className) => rule.includes(`.${className}`)),
        ),
      )
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
    expect(css).toContain('@container now-playing (max-width: 22.5rem)');
    expect(css).toContain('@container now-playing (min-width: 12rem) and (max-width: 22.5rem)');
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h3')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h4')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h5')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-artist] .MuiTypography-h5')).toBeTruthy();
    expect(css).not.toContain('1.35rem + 0.55vw');
  });

  it('uses semantic type and a soft copy scrim instead of a left panel', () => {
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
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h3')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h4')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-artist] .MuiTypography-h5')).toBeTruthy();
    expect(css).toContain('rgba(40, 55, 35, 0.55)');
    expect(css).toContain('#e7d48a');
    expect(css).not.toContain('#3f522c');
    expect(css).not.toContain('ellipse 58% 52% at 94% 8%');
  });

  it('defaults to the cell layout', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const card = document.querySelector('[data-bento="now-playing"]');
    expect(card).toHaveAttribute('data-now-playing-layout', 'cell');
    expect(document.querySelector('[data-now-playing-hero]')).toBeNull();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h2')).toBeNull();
    expect(
      document.querySelector('[data-now-playing-art] img')?.getAttribute('sizes') ?? '',
    ).toContain('160px');
  });

  it('swaps to the landscape hero layout and keeps the cell fallback query', () => {
    render(
      <TestWrapper>
        <NowPlayingCard layout="hero" track={track} />
      </TestWrapper>,
    );

    const card = document.querySelector('[data-bento="now-playing"]');
    expect(card).toHaveAttribute('data-now-playing-layout', 'hero');
    expect(document.querySelector('[data-now-playing-hero]')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h2')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-artist] .MuiTypography-h5')).toBeTruthy();
    expect(
      document.querySelector('[data-now-playing-art] img')?.getAttribute('sizes') ?? '',
    ).toContain('800px');

    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');
    expect(css).toContain('@container now-playing (min-width: 30rem)');
    expect(css).toContain('padding-left: 32px');
    expect(css).toContain('margin-top: 20px');
    expect(css).toContain('calc(100% - 40px)');
    expect(css).toContain('border-radius: 20px');
    expect(css).toContain('scaleX(-1)');
    expect(css).toContain('at 18% 16%');
    expect(css).toContain('at 24% 84%');
  });
});
