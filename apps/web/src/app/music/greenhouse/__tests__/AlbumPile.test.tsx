import { render, screen } from '@testing-library/react';
import { AlbumPile } from '../AlbumPile';

jest.mock('../albumPile.module.css', () => ({
  cover: 'cover',
  pile: 'pile',
  pill: 'pill',
  scrim: 'scrim',
  stage: 'stage',
}));

describe('AlbumPile', () => {
  it('fans four to six covers and names only the front', () => {
    const { container } = render(
      <AlbumPile
        count={12}
        imageUrl="https://i.scdn.co/image/ab67616d0000b2734018b70099d433d9c8aabb12"
        name="USB"
      />,
    );

    expect(container.querySelectorAll('[data-depth]').length).toBeGreaterThanOrEqual(4);
    expect(container.querySelectorAll('[data-depth]').length).toBeLessThanOrEqual(6);
    expect(screen.getAllByRole('img').map((image) => image.getAttribute('alt'))).toEqual(['USB']);
    expect(screen.getByText('12 songs')).toBeInTheDocument();
  });

  it('hides the pill when there is no count', () => {
    render(
      <AlbumPile
        imageUrl="https://i.scdn.co/image/ab67616d0000b2734018b70099d433d9c8aabb12"
        name="USB"
      />,
    );

    expect(screen.queryByText(/songs|plays/)).not.toBeInTheDocument();
  });
});
