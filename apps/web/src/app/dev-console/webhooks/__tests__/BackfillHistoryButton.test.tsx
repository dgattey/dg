import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../../../../services/strava.actions', () => ({
  backfillStravaHistory: jest.fn(),
}));

import { backfillStravaHistory } from '../../../../services/strava.actions';
import { BackfillHistoryButton } from '../BackfillHistoryButton';

describe('BackfillHistoryButton', () => {
  it('shows what the backfill saved', async () => {
    const user = userEvent.setup();
    jest.mocked(backfillStravaHistory).mockResolvedValue({
      message: '203 added, 2 updated, 2 pages read.',
      success: true,
    });

    render(<BackfillHistoryButton />);
    await user.click(screen.getByRole('button', { name: 'Backfill history' }));

    expect(await screen.findByText('203 added, 2 updated, 2 pages read.')).toBeInTheDocument();
  });

  it('shows why a backfill stopped', async () => {
    const user = userEvent.setup();
    jest.mocked(backfillStravaHistory).mockResolvedValue({
      error: 'Strava rate limit reached on page 2. 200 added, 0 updated, 1 page read.',
      success: false,
    });

    render(<BackfillHistoryButton />);
    await user.click(screen.getByRole('button', { name: 'Backfill history' }));

    expect(
      await screen.findByText(
        'Strava rate limit reached on page 2. 200 added, 0 updated, 1 page read.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Backfill history' })).toBeEnabled();
  });
});
