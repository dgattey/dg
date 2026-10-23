import type { Track } from '@dg/content-models/spotify/Track';
import { render, screen } from '@testing-library/react';
import { SpotifyHeaderCard } from '../SpotifyHeaderCard';

let mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

jest.mock('../../../services/spotify.actions', () => ({
  loadLatestSong: jest.fn(async () => null),
}));

jest.mock('../MusicNotes', () => ({
  MusicNotes: ({ isPlaying }: { isPlaying: boolean }) => (
    <div data-playing={String(isPlaying)} data-testid="notes" />
  ),
}));

const TRACK: Track = {
  album: {
    externalUrls: { spotify: 'https://open.spotify.com/album' },
    href: 'https://api.spotify.com/album',
    id: 'album',
    images: [],
    name: 'Album',
    releaseDate: '2026-01-01',
    uri: 'spotify:album:album',
  },
  albumImage: { height: 640, url: 'https://images.test/album.jpg', width: 640 },
  artists: [],
  externalUrls: { spotify: 'https://open.spotify.com/track' },
  href: 'https://api.spotify.com/track',
  id: 'track',
  isPlaying: true,
  name: 'Perfect Light',
  uri: 'spotify:track:track',
};

describe('SpotifyHeaderCard', () => {
  it.each([
    ['/music', '/reading'],
    ['/reading', '/music'],
    ['/', '/reading'],
    ['/reading', '/'],
  ])('keeps the same floating notes DOM node mounted when navigating from %s to %s', (from, to) => {
    mockPathname = from;
    const { rerender } = render(<SpotifyHeaderCard track={TRACK} />);
    const notesBefore = screen.getByTestId('notes');
    expect(notesBefore).toHaveAttribute('data-playing', 'true');

    mockPathname = to;
    rerender(<SpotifyHeaderCard track={TRACK} />);

    const notesAfter = screen.getByTestId('notes');
    expect(notesAfter).toBe(notesBefore);
    expect(notesAfter).toHaveAttribute('data-playing', 'true');
  });
});
