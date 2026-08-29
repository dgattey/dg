import { render, screen } from '@testing-library/react';
import { ErrorLayout } from '../ErrorLayout';

describe('ErrorLayout', () => {
  it.each([
    [404, 'Sorry, couldn‘t find that page.', 'Email me if something is wrong.'],
    [500, 'Something went wrong on my end.', 'Email me if it keeps happening.'],
  ])('renders the %i collage error in shared chrome', (statusCode, heading, message) => {
    render(<ErrorLayout statusCode={statusCode} surface="collage" />);

    expect(screen.getByRole('heading', { level: 1, name: String(statusCode) })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Back home')).toBeInTheDocument();
  });
});
