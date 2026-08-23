import { render, screen } from '@testing-library/react';
import { TopArtistsCard } from '../TopArtistsCard';
import { TopTracksCard } from '../TopTracksCard';

const tracks = [
  {
    artist: 'SHIMA',
    id: 'invisible',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2738122fba63d36ca8dc001661f',
    playCount: 3,
    title: 'INVISIBLE',
    url: 'https://open.spotify.com/track/invisible',
  },
];

const artists = [
  {
    id: 'SHIMA',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b2738122fba63d36ca8dc001661f',
    name: 'SHIMA',
    playCount: 3,
    url: 'https://open.spotify.com/track/invisible',
  },
];

describe('greenhouse music lists', () => {
  it('renders top tracks as ranked rows', () => {
    render(<TopTracksCard tracks={tracks} />);

    expect(screen.getByText('Top tracks')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'INVISIBLE' })).toBeInTheDocument();
    expect(screen.getByText('SHIMA')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders top artists as ranked rows', () => {
    render(<TopArtistsCard artists={artists} />);

    expect(screen.getByText('Top artists')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'SHIMA' })).toBeInTheDocument();
    expect(screen.getByText('3 plays')).toBeInTheDocument();
  });
});
