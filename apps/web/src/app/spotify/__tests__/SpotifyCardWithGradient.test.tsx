/**
 * @jest-environment jsdom
 */

import type { Track } from '@dg/content-models/spotify/Track';
import { act, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { extractAlbumGradientFromUrl } from '../extractAlbumGradient';
import { SpotifyCardWithGradient } from '../SpotifyCardWithGradient';

jest.mock('@dg/ui/dependent/ContentCard', () => ({
  ContentCard: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

jest.mock('../AlbumGradientBackdrop', () => ({
  AlbumGradientBackdrop: ({ gradient }: { gradient?: string }) => (
    <div data-gradient={gradient} data-testid="gradient-backdrop" />
  ),
}));

jest.mock('../SpotifyCardScrollTracker', () => ({
  SpotifyCardScrollTracker: ({ children }: { children: ReactNode }) => (
    <div data-testid="scroll-tracker">{children}</div>
  ),
}));

jest.mock('../TrackListing', () => ({
  TrackListing: ({ surface, track }: { surface?: string; track: Track }) => (
    <div data-surface={surface ?? 'classic'} data-testid="track-listing">
      <span>{track.name}</span>
      <span>{track.artists[0]?.name}</span>
      <span>{track.albumImage.url}</span>
    </div>
  ),
}));

jest.mock('../extractAlbumGradient', () => ({
  extractAlbumGradientFromUrl: jest.fn(),
}));

const OLD_GRADIENT = 'radial-gradient(old-blue)';
const NEW_GRADIENT = 'radial-gradient(new-orange)';

const makeTrack = (id: string, gradient?: string): Track => {
  const core = {
    externalUrls: { spotify: `https://open.spotify.com/${id}` },
    href: `https://api.spotify.com/${id}`,
    id,
    name: `Track ${id}`,
    uri: `spotify:track:${id}`,
  };
  return {
    ...core,
    album: {
      ...core,
      images: [{ height: 640, url: `https://images.test/${id}.jpg`, width: 640 }],
      name: `Album ${id}`,
      releaseDate: '2026-01-01',
    },
    albumGradient: gradient,
    albumGradientContrastSetting: gradient ? 'light' : undefined,
    albumImage: { height: 640, url: `https://images.test/${id}.jpg`, width: 640 },
    artists: [{ ...core, id: `artist-${id}`, name: `Artist ${id}` }],
    isPlaying: true,
  };
};

type GradientInformation = Awaited<ReturnType<typeof extractAlbumGradientFromUrl>>;

const deferredGradient = () => {
  let resolve!: (value: GradientInformation) => void;
  const promise = new Promise<GradientInformation>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('SpotifyCardWithGradient', () => {
  const mockExtractAlbumGradient = jest.mocked(extractAlbumGradientFromUrl);

  beforeEach(() => {
    mockExtractAlbumGradient.mockReset();
  });

  it('renders the next track before its colors are ready', () => {
    mockExtractAlbumGradient.mockImplementation(() => deferredGradient().promise);
    const { rerender } = render(<SpotifyCardWithGradient track={makeTrack('old', OLD_GRADIENT)} />);

    rerender(<SpotifyCardWithGradient track={makeTrack('new')} />);

    expect(screen.getByText('Track new')).toBeInTheDocument();
    expect(screen.getByText('Artist new')).toBeInTheDocument();
    expect(screen.getByText('https://images.test/new.jpg')).toBeInTheDocument();
    expect(screen.queryByText('Track old')).not.toBeInTheDocument();
  });

  it('keeps the previous gradient until the next one resolves', async () => {
    const oldExtraction = deferredGradient();
    const newExtraction = deferredGradient();
    mockExtractAlbumGradient
      .mockReturnValueOnce(oldExtraction.promise)
      .mockReturnValueOnce(newExtraction.promise);
    const { rerender } = render(<SpotifyCardWithGradient track={makeTrack('old', OLD_GRADIENT)} />);

    rerender(<SpotifyCardWithGradient track={makeTrack('new')} />);

    for (const backdrop of screen.getAllByTestId('gradient-backdrop')) {
      expect(backdrop).toHaveAttribute('data-gradient', OLD_GRADIENT);
    }

    await act(async () => {
      newExtraction.resolve({
        backgroundGradient: NEW_GRADIENT,
        contrastSetting: 'dark',
      });
      await newExtraction.promise;
    });

    for (const backdrop of screen.getAllByTestId('gradient-backdrop')) {
      expect(backdrop).toHaveAttribute('data-gradient', NEW_GRADIENT);
    }
  });

  it('uses the collage TrackListing path without gradient extraction', () => {
    render(<SpotifyCardWithGradient surface="collage" track={makeTrack('collage')} />);

    expect(screen.getByTestId('scroll-tracker')).toBeInTheDocument();
    expect(screen.getByTestId('track-listing')).toHaveAttribute('data-surface', 'collage');
    expect(screen.getByText('Track collage')).toBeInTheDocument();
    expect(screen.queryByTestId('gradient-backdrop')).not.toBeInTheDocument();
    expect(mockExtractAlbumGradient).not.toHaveBeenCalled();
  });
});
