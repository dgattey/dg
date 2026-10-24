import type { Track } from '@dg/content-models/spotify/Track';
import { ServerTimeProvider } from '@dg/ui/core/ServerTimeContext';
import { render, screen } from '@testing-library/react';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';
import { TrackListing } from '../TrackListing';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../../../services/spotify.actions', () => ({
  loadLatestSong: jest.fn(async () => null),
}));

const TRACK: Track = {
  album: {
    id: 'album',
    name: 'Album',
    releaseDate: '2026-01-01',
    url: 'https://open.spotify.com/album',
  },
  albumGradient: 'linear-gradient(165deg, #2d3246 0%, #5c2824 100%)',
  albumGradientContrastSetting: 'dark',
  albumImage: { height: 640, url: 'https://images.test/album.jpg', width: 640 },
  artists: [{ id: 'marina', name: 'MARINA', url: 'https://open.spotify.com/artist/marina' }],
  id: 'track',
  isPlaying: true,
  name: 'Perfect Light',
  url: 'https://open.spotify.com/track',
};

describe('SpotifyHeaderCard and TrackListing', () => {
  it.each([
    ['/music', '/reading'],
    ['/reading', '/music'],
    ['/', '/reading'],
    ['/reading', '/'],
  ])(
    'keeps the same bouncing art DOM node mounted without header notes when navigating from %s to %s',
    (from, to) => {
      mockPathname = from;
      const { container, rerender } = render(
        <ServerTimeProvider serverTime={1_760_000_000_000}>
          <SpotifyHeaderCard track={TRACK} />
        </ServerTimeProvider>,
      );
      const bounceBefore = container.querySelector('[data-art-notes-bounce]');
      expect(bounceBefore).not.toBeNull();
      expect(container.querySelector('[data-ambient-notes]')).toBeNull();

      mockPathname = to;
      rerender(
        <ServerTimeProvider serverTime={1_760_000_000_000}>
          <SpotifyHeaderCard track={TRACK} />
        </ServerTimeProvider>,
      );

      const bounceAfter = container.querySelector('[data-art-notes-bounce]');
      expect(bounceAfter).toBe(bounceBefore);
      expect(container.querySelector('[data-ambient-notes]')).toBeNull();
    },
  );

  it('emanates music notes and forwards data-track-title on the full card when playing', () => {
    const { container } = render(
      <ServerTimeProvider serverTime={1_760_000_000_000}>
        <TrackListing track={TRACK} variant="card" />
      </ServerTimeProvider>,
    );

    expect(container.querySelector('[data-ambient-notes]')).not.toBeNull();
    const titleLink = screen.getByRole('link', { name: 'Perfect Light' });
    expect(titleLink).toHaveAttribute('data-track-title', '');
    expect(titleLink).toHaveAttribute('data-has-color', '');
  });
});
