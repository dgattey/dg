import { render, screen } from '@testing-library/react';
import { AlbumsGreenhouseGrid } from '../AlbumsGreenhouseGrid';

jest.mock('../albumPile.module.css', () => ({
  cover: 'cover',
  pile: 'pile',
  pill: 'pill',
  scrim: 'scrim',
  stage: 'stage',
}));

const albums = [
  {
    addedAt: '2026-01-01T00:00:00Z',
    artistNames: 'Fred again.., Jamie T',
    id: '2ClZ9xWAYg1BH8zkR96dJo',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2734018b70099d433d9c8aabb12',
    name: 'USB',
    primaryArtist: 'Fred again..',
    releaseDate: '2022-01-01',
    url: 'https://open.spotify.com/album/2ClZ9xWAYg1BH8zkR96dJo',
  },
];

describe('AlbumsGreenhouseGrid', () => {
  it('renders glass pile cells with album · artist captions', () => {
    render(<AlbumsGreenhouseGrid albums={albums} />);

    expect(screen.getByRole('heading', { name: 'USB' })).toBeInTheDocument();
    expect(screen.getByText('Fred again.., Jamie T')).toBeInTheDocument();
    expect(document.querySelector('[data-albums-greenhouse]')).toBeTruthy();
    expect(document.querySelector('[data-album-pile]')).toBeTruthy();
    expect(screen.getByRole('link', { name: /USB/ }).getAttribute('href')).toContain(
      '2ClZ9xWAYg1BH8zkR96dJo',
    );
  });
});
