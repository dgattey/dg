/**
 * @jest-environment jsdom
 */

import type { Track } from '@dg/content-models/spotify/Track';
import { render, screen } from '@testing-library/react';
import { SpotifyCardAsync } from '../SpotifyCard';

const mockGetLatestSong = jest.fn();

jest.mock('../../../services/spotify', () => ({
  getLatestSong: () => mockGetLatestSong(),
}));

jest.mock('../../spotify/SpotifyCardWithGradient', () => ({
  SpotifyCardWithGradient: ({ surface, track }: { surface?: string; track: Track }) => (
    <div data-surface={surface ?? 'classic'} data-testid="spotify-gradient">
      {track.name}
    </div>
  ),
}));

const track = {
  album: {
    externalUrls: { spotify: 'https://open.spotify.com/album/1' },
    href: '',
    id: 'a',
    images: [],
    name: 'Album',
    releaseDate: '2026-01-01',
    uri: '',
  },
  albumImage: { height: 640, url: 'https://images.test/a.jpg', width: 640 },
  artists: [
    {
      externalUrls: { spotify: 'https://open.spotify.com/artist/1' },
      href: '',
      id: 'ar',
      name: 'Artist',
      uri: '',
    },
  ],
  externalUrls: { spotify: 'https://open.spotify.com/track/1' },
  href: '',
  id: 't',
  name: 'Song',
  uri: '',
} as Track;

describe('SpotifyCardAsync', () => {
  beforeEach(() => {
    mockGetLatestSong.mockReset();
  });

  it('returns null when the track is missing for both surfaces', async () => {
    mockGetLatestSong.mockResolvedValue(null);

    const classic = render(await SpotifyCardAsync({ surface: 'classic' }));
    expect(classic.container).toBeEmptyDOMElement();

    const collage = render(await SpotifyCardAsync({ surface: 'collage' }));
    expect(collage.container).toBeEmptyDOMElement();
  });

  it('passes the track and surface to SpotifyCardWithGradient', async () => {
    mockGetLatestSong.mockResolvedValue(track);

    render(await SpotifyCardAsync({ surface: 'collage' }));

    expect(screen.getByTestId('spotify-gradient')).toHaveAttribute('data-surface', 'collage');
    expect(screen.getByTestId('spotify-gradient')).toHaveTextContent('Song');
  });
});
