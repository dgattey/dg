import { render, screen } from '@testing-library/react';
import { DevConsoleCardBoundary } from '../DevConsoleCardBoundary';

function Exploding(): never {
  throw Object.assign(new Error('card blew up'), { digest: 'abc123' });
}

describe('DevConsoleCardBoundary', () => {
  beforeEach(() => {
    // React logs the caught error, which is noise for a test that expects one.
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when nothing fails', () => {
    render(
      <DevConsoleCardBoundary>
        <p>Strava webhooks</p>
      </DevConsoleCardBoundary>,
    );

    expect(screen.getByText('Strava webhooks')).toBeInTheDocument();
  });

  it('contains a failing card and points at the log line', () => {
    render(
      <DevConsoleCardBoundary>
        <Exploding />
      </DevConsoleCardBoundary>,
    );

    expect(screen.getByText(/This card failed to load \(digest abc123\)/)).toBeInTheDocument();
  });
});
