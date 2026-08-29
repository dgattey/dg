import { invariant } from '@dg/shared-core/helpers/invariant';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ServerActionButton } from '../ServerActionButton';

describe('ServerActionButton', () => {
  it('keeps loading and success behavior on the collage surface', async () => {
    const user = userEvent.setup();
    let resolveAction: ((result: { success: boolean }) => void) | undefined;
    const action = jest.fn(
      () =>
        new Promise<{ success: boolean }>((resolve) => {
          resolveAction = resolve;
        }),
    );
    const onSuccess = jest.fn();

    render(
      <ServerActionButton
        action={action}
        label="Force refresh token"
        loadingLabel="Refreshing..."
        onSuccess={onSuccess}
        surface="collage"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Force refresh token' }));

    expect(screen.getByRole('button', { name: 'Refreshing...' })).toBeDisabled();
    invariant(resolveAction, 'Expected the server action to start');
    resolveAction({ success: true });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Force refresh token' })).toBeEnabled();
    });
  });

  it('shows returned action errors on the collage surface', async () => {
    const user = userEvent.setup();

    render(
      <ServerActionButton
        action={() => Promise.resolve({ error: 'Refresh failed', success: false })}
        label="Force refresh token"
        loadingLabel="Refreshing..."
        surface="collage"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Force refresh token' }));

    expect(await screen.findByText('Refresh failed')).toBeInTheDocument();
  });
});
