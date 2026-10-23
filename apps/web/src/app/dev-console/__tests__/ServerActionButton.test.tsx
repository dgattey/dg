import { invariant } from '@dg/shared-core/assertions/invariant';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerActionButton } from '../ServerActionButton';

const refresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

describe('ServerActionButton', () => {
  beforeEach(() => {
    refresh.mockClear();
  });

  it('handles loading, message display, and optional router refresh on success', async () => {
    const user = userEvent.setup();
    let resolveAction: ((result: { message?: string; success: boolean }) => void) | undefined;
    const action = jest.fn(
      () =>
        new Promise<{ message?: string; success: boolean }>((resolve) => {
          resolveAction = resolve;
        }),
    );

    render(
      <ServerActionButton
        action={action}
        label="Force refresh token"
        loadingLabel="Refreshing..."
        refreshOnSuccess
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Force refresh token' }));

    expect(screen.getByRole('button', { name: 'Refreshing...' })).toBeDisabled();
    invariant(resolveAction, 'Expected the server action to start');
    resolveAction({ message: '203 added, 2 updated, 2 pages read.', success: true });

    await waitFor(() => {
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Force refresh token' })).toBeEnabled();
      expect(screen.getByText('203 added, 2 updated, 2 pages read.')).toBeInTheDocument();
    });
  });

  it('shows returned action errors', async () => {
    const user = userEvent.setup();

    render(
      <ServerActionButton
        action={() => Promise.resolve({ error: 'Refresh failed', success: false })}
        label="Force refresh token"
        loadingLabel="Refreshing..."
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Force refresh token' }));

    expect(await screen.findByText('Refresh failed')).toBeInTheDocument();
  });
});
