import { render, screen } from '@testing-library/react';
import { MusicGreenhouseGrid } from '../MusicGreenhouseGrid';

describe('MusicGreenhouseGrid', () => {
  it('maps named slots onto 12 columns including history', () => {
    render(
      <MusicGreenhouseGrid
        albums={<div>albums</div>}
        artists={<div>artists</div>}
        history={<div>history</div>}
        intro={<div>intro</div>}
        nowPlaying={<div>now</div>}
        tracks={<div>tracks</div>}
      />,
    );

    expect(screen.getByText('intro').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'intro',
    );
    expect(screen.getByText('now').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'now-playing',
    );
    expect(screen.getByText('albums').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'albums',
    );
    expect(screen.getByText('history').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'history',
    );
    expect(screen.getByText('tracks').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'tracks',
    );
    expect(screen.getByText('artists').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'artists',
    );
    expect(screen.getByText('now').parentElement?.className).not.toContain('nowPlaying');
    expect(screen.getByText('now').parentElement?.parentElement).toHaveAttribute(
      'data-greenhouse-grid',
      'music',
    );
  });

  it('does not shift later slots when on-repeat is missing', () => {
    render(
      <MusicGreenhouseGrid
        artists={<div>artists</div>}
        intro={<div>intro</div>}
        nowPlaying={<div>now</div>}
        tracks={<div>tracks</div>}
      />,
    );

    expect(screen.queryByText('albums')).not.toBeInTheDocument();
    expect(screen.getByText('tracks').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'tracks',
    );
  });
});
