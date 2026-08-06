import { render, screen } from '@testing-library/react';
import { Disc3, Sun } from 'lucide-react';
import { GlassDisclosurePanel, GlassDisclosureRow } from '../GlassDisclosurePanel';

describe('GlassDisclosurePanel', () => {
  it('renders a shared glass surface with row chrome', () => {
    render(
      <GlassDisclosurePanel isOpen label="Test menu" role="menu">
        <GlassDisclosureRow icon={<Sun />} label="Light" />
        <GlassDisclosureRow icon={<Disc3 />} label="Music" />
      </GlassDisclosurePanel>,
    );

    expect(screen.getByRole('menu', { name: 'Test menu' })).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('marks the panel inert while closed', () => {
    render(
      <GlassDisclosurePanel isOpen={false} label="Closed menu">
        <GlassDisclosureRow icon={<Sun />} label="Hidden" />
      </GlassDisclosurePanel>,
    );

    expect(screen.getByLabelText('Closed menu')).toHaveAttribute('inert');
  });
});
