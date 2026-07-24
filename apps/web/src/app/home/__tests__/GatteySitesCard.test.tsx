import { render, screen } from '@testing-library/react';
import { GatteySitesCard } from '../GatteySitesCard';

describe('GatteySitesCard', () => {
  it('links each side project independently', () => {
    render(<GatteySitesCard />);

    expect(screen.getByRole('heading', { name: 'Side projects' })).toBeInTheDocument();

    const wmmLink = screen.getByRole('link', { name: 'WMM' });
    expect(wmmLink).toHaveAttribute('href', 'https://wmm.gattey.com');
    expect(wmmLink).toHaveAttribute('target', '_blank');

    const lostLink = screen.getByRole('link', { name: 'Lost Cities scorer' });
    expect(lostLink).toHaveAttribute('href', 'https://lostcities.app');
    expect(lostLink).toHaveAttribute('target', '_blank');

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });
});
