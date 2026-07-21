import { render, screen } from '@testing-library/react';
import { GatteySitesCard } from '../GatteySitesCard';

describe('GatteySitesCard', () => {
  it('links to the gattey.com project sites', () => {
    render(<GatteySitesCard />);

    expect(screen.getByRole('heading', { name: 'Also on gattey.com' })).toBeInTheDocument();

    const photosLinks = screen.getAllByRole('link', { name: 'Gattey Photos' });
    expect(photosLinks[0]).toHaveAttribute('href', 'https://photos.gattey.com');
    expect(photosLinks[0]).toHaveAttribute('target', '_blank');

    const wmmLinks = screen.getAllByRole('link', { name: 'WMM' });
    expect(wmmLinks[0]).toHaveAttribute('href', 'https://wmm.gattey.com');
    expect(wmmLinks[0]).toHaveAttribute('target', '_blank');
  });
});
