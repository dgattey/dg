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
  it('renders top tracks as ranked body rows under one h3', () => {
    render(<TopTracksCard tracks={tracks} />);

    const title = screen.getByRole('heading', { name: 'Top tracks' });
    expect(title.tagName).toBe('H3');
    expect(title.className).toContain('MuiTypography-h3');
    expect(screen.getByText('Listening').className).toContain('MuiTypography-overline');
    expect(screen.queryByRole('heading', { name: 'INVISIBLE' })).not.toBeInTheDocument();
    expect(screen.getByText('INVISIBLE').className).toContain('MuiTypography-body1');
    expect(screen.getByText('SHIMA').className).toContain('MuiTypography-body2');
    expect(screen.getByText('1').className).toContain('MuiTypography-caption');
    expect(screen.getByRole('link', { name: 'INVISIBLE' })).toHaveAttribute(
      'href',
      'https://open.spotify.com/track/invisible',
    );
  });

  it('renders top artists as ranked body rows under one h3', () => {
    render(<TopArtistsCard artists={artists} />);

    const title = screen.getByRole('heading', { name: 'Top artists' });
    expect(title.tagName).toBe('H3');
    expect(title.className).toContain('MuiTypography-h3');
    expect(screen.getByText('Listening').className).toContain('MuiTypography-overline');
    expect(screen.queryByRole('heading', { name: 'SHIMA' })).not.toBeInTheDocument();
    expect(screen.getByText('SHIMA').className).toContain('MuiTypography-body1');
    expect(screen.getByText('3 plays').className).toContain('MuiTypography-body2');
  });
});
