import { render, screen } from '@testing-library/react';
import { ListeningHeading } from '../ListeningHeading';

describe('ListeningHeading', () => {
  it('uses the greenhouse display title and a body1 line in intro ink', () => {
    render(<ListeningHeading description="Recent Spotify plays." title="Listening" />);

    const title = screen.getByRole('heading', { name: 'Listening' });
    expect(title.tagName).toBe('H1');
    expect(screen.getByText('Recent Spotify plays.')).toBeInTheDocument();
  });
});
