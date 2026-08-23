import { render, screen } from '@testing-library/react';
import { AlbumCover } from '../AlbumCover';
import { AlbumStack } from '../AlbumStack';

const imageUrl = 'https://i.scdn.co/image/clay';

function renderStack(sleeveCount: number) {
  return render(
    <AlbumStack imageUrl={imageUrl} sleeveCount={sleeveCount}>
      <AlbumCover alt="Feet of Clay" depth={0} imageUrl={imageUrl} sleeveCount={sleeveCount} />
    </AlbumStack>,
  );
}

describe('AlbumStack', () => {
  it('draws a sleeve behind the front cover for each one asked for', () => {
    const { container } = renderStack(2);

    expect(container.querySelectorAll('img')).toHaveLength(3);
  });

  it('draws a lone cover when nothing sits behind it', () => {
    const { container } = renderStack(0);

    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('names only the front cover, leaving the sleeves behind it decorative', () => {
    renderStack(2);

    expect(screen.getAllByRole('img').map((image) => image.getAttribute('alt'))).toEqual([
      'Feet of Clay',
    ]);
  });

  it('puts the front cover last so it paints over its sleeves', () => {
    const { container } = renderStack(2);

    const alts = [...container.querySelectorAll('img')].map((image) => image.getAttribute('alt'));
    expect(alts).toEqual(['', '', 'Feet of Clay']);
  });

  it('marks a greenhouse stack without changing the default fan', () => {
    const { container } = render(
      <AlbumStack imageUrl={imageUrl} sleeveCount={2} variant="greenhouse">
        <AlbumCover alt="Feet of Clay" depth={0} imageUrl={imageUrl} sleeveCount={2} />
      </AlbumStack>,
    );

    expect(container.querySelector('[data-album-stack="greenhouse"]')).toBeTruthy();
    expect(container.querySelectorAll('img')).toHaveLength(3);
  });
});
