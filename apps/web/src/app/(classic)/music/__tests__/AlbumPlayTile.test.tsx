import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlbumPlayTile } from '../AlbumPlayTile';

const props = {
  albumName: 'Feet of Clay',
  artistNames: 'Earl Sweatshirt',
  imageUrl: 'https://i.scdn.co/image/clay',
  linkUrl: 'https://open.spotify.com/album/clay',
  trackCount: 12,
  trackName: 'EAST',
};

describe('AlbumPlayTile', () => {
  it('exposes one link to the album with the run described in its label', () => {
    render(<AlbumPlayTile {...props} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Feet of Clay – Earl Sweatshirt, 12 tracks');
    expect(links[0]).toHaveAttribute('href', 'https://open.spotify.com/album/clay');
    expect(links[0]).toHaveAttribute('target', '_blank');
  });

  it('shows the play count in sentence case', () => {
    render(<AlbumPlayTile {...props} />);

    expect(screen.getByText('12 tracks')).toBeInTheDocument();
  });

  it('caps the sleeves it draws no matter how long the run is', () => {
    const { container } = render(<AlbumPlayTile {...props} trackCount={40} />);

    expect(container.querySelectorAll('img')).toHaveLength(3);
    expect(screen.getByText('40 tracks')).toBeInTheDocument();
  });

  it('draws one sleeve behind the cover for a run of two', () => {
    const { container } = render(<AlbumPlayTile {...props} trackCount={2} />);

    expect(container.querySelectorAll('img')).toHaveLength(2);
    expect(screen.getByText('2 tracks')).toBeInTheDocument();
  });

  it('leaves a single play a flat tile named after its track', () => {
    const { container } = render(
      <AlbumPlayTile
        {...props}
        linkUrl="https://open.spotify.com/track/east"
        trackCount={1}
        trackName="EAST"
      />,
    );

    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(screen.queryByText('1 track')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName('Feet of Clay');
  });

  it('reveals the tooltip on keyboard focus', async () => {
    const user = userEvent.setup();
    render(<AlbumPlayTile {...props} />);

    await user.tab();

    expect(screen.getByRole('link')).toHaveFocus();
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Feet of Clay – Earl Sweatshirt, 12 tracks',
    );
  });

  it('names the track in a single play tooltip', async () => {
    const user = userEvent.setup();
    render(<AlbumPlayTile {...props} trackCount={1} />);

    await user.tab();

    expect(screen.getByRole('tooltip')).toHaveTextContent('EAST – Earl Sweatshirt');
  });
});
