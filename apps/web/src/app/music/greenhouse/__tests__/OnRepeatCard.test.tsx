import { render, screen } from '@testing-library/react';
import { OnRepeatCard } from '../OnRepeatCard';

const albums = [
  {
    artistNames: 'Fred again.., Jamie T',
    id: '2ClZ9xWAYg1BH8zkR96dJo',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2734018b70099d433d9c8aabb12',
    name: 'USB',
    playCount: 12,
    url: 'https://open.spotify.com/album/2ClZ9xWAYg1BH8zkR96dJo',
  },
  {
    artistNames: 'Tame Impala',
    id: '79dL7FLiJFOO0EoehUHQBv',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79',
    name: 'Currents',
    playCount: 9,
    url: 'https://open.spotify.com/album/79dL7FLiJFOO0EoehUHQBv',
  },
  {
    artistNames: 'ROSALÍA',
    id: '3goLwu2fkSSmghikOcVufU',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2732b497f6bf340faa8812b940c',
    name: 'LUX (Complete Works)',
    playCount: 8,
    url: 'https://open.spotify.com/album/3goLwu2fkSSmghikOcVufU',
  },
];

describe('OnRepeatCard', () => {
  it('renders three fanned piles with album · artist captions and song pills on glass', () => {
    render(<OnRepeatCard albums={albums} />);

    const heading = screen.getByRole('heading', { name: 'On repeat' });
    expect(heading.tagName).toBe('H3');
    expect(screen.getByText('Listening')).toBeInTheDocument();
    expect(screen.queryByText('Stacked albums')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'USB' })).not.toBeInTheDocument();
    expect(screen.getByText('USB')).toBeInTheDocument();
    expect(screen.getByText('Fred again.., Jamie T')).toBeInTheDocument();
    expect(screen.getByText('12 songs')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-album-pile]')).toHaveLength(3);
    expect(
      document.querySelectorAll('[data-album-pile] [data-depth]').length,
    ).toBeGreaterThanOrEqual(12);
    const cover = screen.getByRole('img', { name: 'USB' });
    expect(cover.getAttribute('sizes') ?? '').toContain('400px');
    const card = document.querySelector('[data-on-repeat]');
    expect(card).toHaveAttribute('data-greenhouse-cell', 'on-repeat');
    expect(document.querySelector('[data-greenhouse-cell="on-repeat-heading"]')).toBeNull();
    expect(document.querySelectorAll('[data-greenhouse-cell="on-repeat-pile"]')).toHaveLength(0);
  });

  it('renders nothing when there are no albums', () => {
    const { container } = render(<OnRepeatCard albums={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
