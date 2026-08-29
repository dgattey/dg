/**
 * @jest-environment jsdom
 */

import type { Track } from '@dg/content-models/spotify/Track';
import { render, screen } from '@testing-library/react';
import { RecordDisc } from '../RecordDisc';

jest.mock('../../spotify/AlbumArtWithNotes', () => ({
  AlbumArtWithNotes: ({
    children,
    wrapperSx,
  }: {
    children: React.ReactNode;
    wrapperSx?: { overflow?: string };
  }) => (
    <div data-notes-wrap="true" data-overflow={wrapperSx?.overflow}>
      {children}
    </div>
  ),
}));

jest.mock('@dg/ui/dependent/Image', () => ({
  Image: ({ alt, url }: { alt: string; url: string }) => <img alt={alt} src={url} />,
}));

jest.mock('@dg/ui/dependent/Link', () => ({
  Link: ({
    children,
    href,
    title,
    'aria-label': ariaLabel,
  }: {
    children?: React.ReactNode;
    href: string;
    title?: string;
    'aria-label'?: string;
  }) => (
    <a aria-label={ariaLabel} href={href} title={title}>
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
  artists: [],
  durationMs: 200_000,
  externalUrls: { spotify: 'https://open.spotify.com/track/1' },
  href: '',
  id: 't',
  isPlaying: true,
  name: 'City of Sound',
  progressMs: 40_000,
  uri: '',
} as Track;

describe('RecordDisc', () => {
  it('wraps the clipped disc so notes can paint outside the record', () => {
    const { container } = render(<RecordDisc track={track} />);

    const notesWrap = container.querySelector('[data-notes-wrap="true"]');
    expect(notesWrap).toHaveAttribute('data-overflow', 'visible');
    expect(notesWrap?.querySelector('img')).toHaveAttribute('src', 'https://images.test/cover.jpg');
    expect(screen.getByRole('link', { name: 'Spotify' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/1',
    );
    expect(screen.getByTitle('City LP')).toHaveAttribute(
      'href',
      'https://open.spotify.com/album/1',
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
