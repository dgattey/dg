import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlbumStack } from '../AlbumStack';

const props = {
  albumName: 'Feet of Clay',
  artistNames: 'Earl Sweatshirt',
  imageUrl: 'https://i.scdn.co/image/clay',
  linkUrl: 'https://open.spotify.com/album/clay',
  trackCount: 12,
};

describe('AlbumStack', () => {
  it('exposes one link to the album with the run described in its label', () => {
    render(<AlbumStack {...props} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Feet of Clay – Earl Sweatshirt, 12 tracks');
    expect(links[0]).toHaveAttribute('href', 'https://open.spotify.com/album/clay');
    expect(links[0]).toHaveAttribute('target', '_blank');
  });

  it('shows the play count in sentence case', () => {
    render(<AlbumStack {...props} />);

    expect(screen.getByText('12 tracks')).toBeInTheDocument();
  });

  it('names only the front cover, leaving the sleeves behind it decorative', () => {
    render(<AlbumStack {...props} />);

    expect(screen.getAllByRole('img').map((image) => image.getAttribute('alt'))).toEqual([
      'Feet of Clay',
    ]);
  });

  it('caps the sleeves it draws no matter how long the run is', () => {
    const { container } = render(<AlbumStack {...props} trackCount={40} />);

    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(screen.getByText('40 tracks')).toBeInTheDocument();
  });

  it('draws one sleeve behind the cover for a run of two', () => {
    const { container } = render(<AlbumStack {...props} trackCount={2} />);

    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(screen.getByText('2 tracks')).toBeInTheDocument();
  });

  it('reveals the tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(<AlbumStack {...props} />);

    await user.tab();

    expect(screen.getByRole('link')).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Feet of Clay – Earl Sweatshirt, 12 tracks',
    );
  });
});
