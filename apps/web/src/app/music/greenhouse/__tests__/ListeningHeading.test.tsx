import { render, screen } from '@testing-library/react';
import { ListeningHeading } from '../ListeningHeading';

describe('ListeningHeading', () => {
  it('uses the greenhouse display title and a body1 line on intro glass', () => {
    render(<ListeningHeading description="Recent Spotify plays." title="Listening" />);

    const title = screen.getByRole('heading', { name: 'Listening' });
    expect(title.tagName).toBe('H1');
    expect(title.className).toContain('MuiTypography-h1');
    expect(screen.getByText('Recent Spotify plays.').className).toContain('MuiTypography-body1');
    const card = document.querySelector('[data-music-heading]');
    expect(card).toHaveAttribute('data-greenhouse-cell', 'intro');
  });

  it('accepts a foliage cell name for the albums heading', () => {
    render(<ListeningHeading cell="albums-heading" description="Saved records." title="Albums" />);

    const title = screen.getByRole('heading', { name: 'Albums' });
    expect(title.tagName).toBe('H1');
    expect(title.className).toContain('MuiTypography-h1');
    expect(screen.getByText('Saved records.').className).toContain('MuiTypography-body1');
    expect(document.querySelector('[data-music-heading]')).toHaveAttribute(
      'data-greenhouse-cell',
      'albums-heading',
    );
  });
});
