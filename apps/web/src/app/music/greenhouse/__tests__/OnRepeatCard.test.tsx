import { render, screen } from '@testing-library/react';
import { OnRepeatCard } from '../OnRepeatCard';

jest.mock('../albumStack.module.css', () => ({
  stack: 'greenhouse-stack',
}));

const albums = [
  {
    artistNames: 'Fred again.., Jamie T',
    id: '2ClZ9xWAYg1BH8zkR96dJo',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2734018b70099d433d9c8aabb12',
    name: 'USB',
    playCount: 4,
    url: 'https://open.spotify.com/album/2ClZ9xWAYg1BH8zkR96dJo',
  },
  {
    artistNames: 'Tame Impala',
    id: '79dL7FLiJFOO0EoehUHQBv',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2739e1cfc756886ac782e363d79',
    name: 'Currents',
    playCount: 2,
    url: 'https://open.spotify.com/album/79dL7FLiJFOO0EoehUHQBv',
  },
];

describe('OnRepeatCard', () => {
  it('renders stacked albums in a glass card with caption meta', () => {
    render(<OnRepeatCard albums={albums} />);

    expect(screen.getByText('On repeat')).toBeInTheDocument();
    expect(screen.getByText('Stacked albums')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'USB' })).toBeInTheDocument();
    expect(screen.getByText(/Fred again/)).toBeInTheDocument();
    expect(document.querySelector('[data-album-stack="greenhouse"]')).toBeTruthy();
    const cover = document.querySelector('img');
    expect(cover?.getAttribute('sizes') ?? '').toContain('400px');
  });

  it('renders nothing when there are no albums', () => {
    const { container } = render(<OnRepeatCard albums={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
