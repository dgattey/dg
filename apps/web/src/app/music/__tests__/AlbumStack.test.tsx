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

  it('loads only the front cover (depth === 0) eagerly when marked as LCP candidate', () => {
    const { container } = render(
      <AlbumStack imageUrl={imageUrl} sleeveCount={2}>
        <AlbumCover
          alt="Feet of Clay"
          depth={0}
          imageUrl={imageUrl}
          isLcpCandidate={true}
          sleeveCount={2}
        />
      </AlbumStack>,
    );

    const priorities = [...container.querySelectorAll('img')].map(
      (image) =>
        `${image.getAttribute('loading')}/${image.getAttribute('fetchpriority') ?? 'auto'}`,
    );
    expect(priorities).toEqual(['lazy/auto', 'lazy/auto', 'eager/high']);
  });

  it('requests 300px (1x) and 640px (2x) Spotify CDN variants directly without /_next/image', () => {
    const hash = '2b497f6bf340faa8812b940c';
    const spotifyUrl = `https://i.scdn.co/image/ab67616d0000b273${hash}`;
    render(<AlbumCover alt="Feet of Clay" depth={0} imageUrl={spotifyUrl} sleeveCount={0} />);

    const cover = screen.getByRole('img', { name: 'Feet of Clay' });
    expect(cover).toHaveAttribute(
      'srcset',
      `https://i.scdn.co/image/ab67616d00001e02${hash} 1x, https://i.scdn.co/image/ab67616d0000b273${hash} 2x`,
    );
    expect(cover).toHaveAttribute('src', `https://i.scdn.co/image/ab67616d0000b273${hash}`);
  });
});
