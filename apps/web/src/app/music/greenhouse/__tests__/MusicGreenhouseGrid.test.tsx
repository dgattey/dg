import { render, screen } from '@testing-library/react';
import { MusicGreenhouseGrid } from '../MusicGreenhouseGrid';

jest.mock('../../../greenhouse/greenhouse.module.css', () => ({
  cell: 'cell',
  grid: 'grid',
  nowPlaying: 'nowPlaying',
}));

describe('MusicGreenhouseGrid', () => {
  it('maps the four music slots onto the shared 12-col grid', () => {
    render(
      <MusicGreenhouseGrid>
        <div>now</div>
        <div>albums</div>
        <div>tracks</div>
        <div>artists</div>
      </MusicGreenhouseGrid>,
    );

    expect(screen.getByText('now').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'now-playing',
    );
    expect(screen.getByText('albums').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'albums',
    );
    expect(screen.getByText('tracks').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'tracks',
    );
    expect(screen.getByText('artists').parentElement).toHaveAttribute(
      'data-greenhouse-cell',
      'artists',
    );
    expect(screen.getByText('now').parentElement?.parentElement).toHaveAttribute(
      'data-greenhouse-grid',
      'music',
    );
  });
});
