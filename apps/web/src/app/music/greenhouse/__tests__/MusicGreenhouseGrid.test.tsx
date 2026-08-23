import { render, screen } from '@testing-library/react';
import { MusicGreenhouseGrid } from '../MusicGreenhouseGrid';

describe('MusicGreenhouseGrid', () => {
  it('maps intro, landscape hero, on-repeat, and the two lists onto 12 columns', () => {
    render(
      <MusicGreenhouseGrid>
        <div>intro</div>
        <div>now</div>
        <div>albums</div>
        <div>tracks</div>
        <div>artists</div>
      </MusicGreenhouseGrid>,
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
});
