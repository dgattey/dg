import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { HISTORY_BACKDROP } from '../../collage/backdrops';
import { MusicPageShell } from '../MusicPageShell';

function NeverResolves(): never {
  throw new Promise(() => undefined);
}

describe('MusicPageShell', () => {
  it('shows the title while the page content is still loading', () => {
    render(
      <MusicPageShell backdrop={HISTORY_BACKDROP} title="Listening history">
        <Suspense fallback={<p>Loading</p>}>
          <NeverResolves />
        </Suspense>
      </MusicPageShell>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Listening history');
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
