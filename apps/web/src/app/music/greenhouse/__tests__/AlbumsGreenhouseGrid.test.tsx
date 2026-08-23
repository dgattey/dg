import { render, screen } from '@testing-library/react';
import { AlbumsGreenhouseGrid } from '../AlbumsGreenhouseGrid';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn() })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
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
  it('restores the sortable favorite grid with name – artist tooltips', () => {
    render(<AlbumsGreenhouseGrid albums={albums} />);

    expect(document.querySelector('[data-albums-greenhouse]')).toBeTruthy();
    expect(document.querySelector('[data-greenhouse-cell="albums-toolbar"]')).toBeNull();
    expect(document.querySelector('[data-greenhouse-cell="albums-grid"]')).toBeTruthy();
    expect(document.querySelector('[data-sticky-fade]')).toBeNull();
    const albumsCard = document.querySelector('[data-greenhouse-cell="albums-grid"]');
    expect(albumsCard?.querySelector('[data-role="glass-switcher"]')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'USB' }).getAttribute('href')).toContain(
      '2ClZ9xWAYg1BH8zkR96dJo',
    );
    expect(document.querySelector('[data-role="glass-switcher"]')).toBeTruthy();
    expect(screen.getAllByText('Recently added').length).toBeGreaterThan(0);
    expect(screen.getByRole('img', { name: 'USB' })).toBeInTheDocument();
  });
});
