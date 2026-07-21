import { render, screen } from '@testing-library/react';
import { GatteySitesCard } from '../GatteySitesCard';

describe('GatteySitesCard', () => {
  it('links to the gattey.com project sites', () => {
    render(<GatteySitesCard />);

    expect(screen.getByRole('heading', { name: 'Also on gattey.com' })).toBeInTheDocument();
    expect(screen.getByText('Family gallery uploads and frame sync')).toBeInTheDocument();
    expect(screen.getByText('What you own, where it sits')).toBeInTheDocument();

    // Link title becomes aria-label, so title + description share the site name.
    const photosLinks = screen.getAllByRole('link', { name: 'Gattey Photos' });
    expect(photosLinks).toHaveLength(2);
    for (const link of photosLinks) {
      expect(link).toHaveAttribute('href', 'https://photos.gattey.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    }

    const wmmLinks = screen.getAllByRole('link', { name: 'WMM' });
    expect(wmmLinks).toHaveLength(2);
    for (const link of wmmLinks) {
      expect(link).toHaveAttribute('href', 'https://wmm.gattey.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    }
  });
});
