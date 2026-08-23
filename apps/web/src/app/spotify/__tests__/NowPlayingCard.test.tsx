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
  it('shows the Spotify logo, track, artist, and progress', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const logo = document.querySelector('[data-now-playing-logo] a');
    expect(logo).toHaveAttribute('href', 'https://open.spotify.com/artist/a');
    expect(screen.getByText(/now playing/i)).toBeInTheDocument();
    expect(screen.getAllByText('Leaflight').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Alder & Moss')).toBeInTheDocument();
    expect(document.querySelector('[data-now-playing-progress]')).toBeTruthy();
  });

  it('keeps album art large and drops the leaf and watercolor sprig', () => {
    const { container } = render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    expect(container.querySelector('[data-watercolor-leaves]')).toBeNull();
    expect(container.querySelector('[data-watercolor-blooms]')).toBeNull();
    expect(container.querySelector('[data-now-playing-leaf]')).toBeNull();
    expect(container.querySelector('[data-resting-notes]')).toBeNull();
    expect(container.querySelector('[data-now-playing-art]')).toBeTruthy();
    expect(container.querySelector('[data-now-playing-logo]')).toBeTruthy();

    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');
    expect(css).toContain('calc(100cqi - 4.5rem)');
    expect(css).toContain('margin-left: auto');
    expect(css).not.toContain('@container now-playing (max-width: 264px)');
    expect(css).not.toContain('width: 64px');
    expect(css).not.toContain('height: 64px');
  });

  it('shows the album cover with a 2x sizes hint', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const art = document.querySelector('[data-now-playing-art] img');
    expect(art).toBeTruthy();
    expect(art).toHaveAttribute('alt', 'Glasshouse');
    expect(art?.getAttribute('src') ?? '').toContain('art.jpg');
    expect(art?.getAttribute('sizes') ?? '').toContain('448px');
  });

  it('uses the original note scatter while a track is playing', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-music-notes="default"]')).toBeTruthy();
  });

  it('hides notes when playback is idle', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={{ ...track, isPlaying: false }} />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-music-notes]')).toBeNull();
  });

  it('does not print playback timestamps on the home card', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    expect(screen.queryByText(/2:47/)).not.toBeInTheDocument();
    expect(screen.queryByText(/4:32/)).not.toBeInTheDocument();
  });

  it('clamps the title to two wrapping lines at word boundaries', () => {
    render(
      <TestWrapper>
        <NowPlayingCard track={track} />
      </TestWrapper>,
    );

    const titles = screen
      .getAllByText('Leaflight')
      .filter((node) => node.className.includes('MuiTypography-h'));
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
    expect(titleCss).toContain('overflow-wrap: break-word');
    expect(titleCss).not.toContain('overflow-wrap: anywhere');

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
    expect(css).toContain('@container now-playing (max-width: 360px)');
    expect(css).toContain('@container now-playing (min-width: 192px) and (max-width: 360px)');
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h3')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h4')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h5')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-artist] .MuiTypography-h5')).toBeTruthy();
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
    ).toContain('448px');
  });

  it('swaps to the landscape hero layout with art in the leading column', () => {
    render(
      <TestWrapper>
        <NowPlayingCard layout="hero" track={track} />
      </TestWrapper>,
    );

    const card = document.querySelector('[data-bento="now-playing"]');
    expect(card).toHaveAttribute('data-now-playing-layout', 'hero');
    expect(document.querySelector('[data-now-playing-hero]')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-title] .MuiTypography-h2')).toBeTruthy();
    expect(document.querySelector('[data-now-playing-logo]')).toBeTruthy();
    expect(
      document.querySelector('[data-now-playing-art] img')?.getAttribute('sizes') ?? '',
    ).toContain('800px');

    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');
    expect(css).toContain('@container now-playing (min-width: 480px)');
    expect(css).toContain('40%');
    expect(css).toContain('aspect-ratio');
    expect(document.querySelector('[data-hero-art-fill]')).toBeTruthy();
    expect(css).toMatch(/padding: 12px|padding: 1\.5/);
  });

  it('paints greenhouse glass and theme type when the album wash is missing', () => {
    const { albumGradient: _gradient, albumGradientContrastSetting: _contrast, ...bare } = track;
    const { container } = render(
      <TestWrapper>
        <NowPlayingCard track={bare} />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-now-playing-fallback]')).toBeTruthy();
    expect(container.querySelector('[data-gradient-layer]')).toBeNull();
    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');
    expect(css).toContain('background: var(--card-bg)');
    expect(css).toContain('backdrop-filter: var(--card-backdrop-filter)');
    const title = document.querySelector('[data-now-playing-title] .MuiTypography-root');
    expect(title).toBeTruthy();
    expect(getComputedStyle(title as Element).color).not.toBe('rgba(0, 0, 0, 0.7)');
    expect(getComputedStyle(title as Element).color).not.toBe('rgba(255, 255, 255, 0.7)');
  });

  it('derives light type on a dark wash when contrastSetting is missing', () => {
    render(
      <TestWrapper>
        <NowPlayingCard
          track={{
            ...track,
            albumGradient: 'linear-gradient(hsla(20, 40%, 18%, 0.9), hsla(20, 30%, 12%, 0.85))',
            albumGradientContrastSetting: undefined,
          }}
        />
      </TestWrapper>,
    );

    expect(document.querySelector('[data-now-playing-fallback]')).toBeNull();
    expect(document.querySelector('[data-gradient-layer]')).toBeTruthy();
    const css = [...document.querySelectorAll('style')]
      .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
      .join('\n');
    expect(css).toContain('rgba(255, 255, 255, 0.7)');
  });
});
