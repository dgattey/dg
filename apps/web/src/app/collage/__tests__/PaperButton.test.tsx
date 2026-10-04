import { render, screen } from '@testing-library/react';
import { PaperButton } from '../PaperButton';

jest.mock('@dg/ui/core/transitions/PageTransitionLink', () => ({
  PageTransitionLink: ({
    'aria-current': ariaCurrent,
    children,
    href,
  }: {
    'aria-current'?: 'page';
    children: React.ReactNode;
    href: string;
  }) => (
    <a aria-current={ariaCurrent} href={href}>
      {children}
    </a>
  ),
}));

describe('PaperButton', () => {
  it('renders a native button with pressed state', () => {
    render(<PaperButton>Light</PaperButton>);
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('wraps controls in paperWrap so focus rings stay unclipped', () => {
    render(<PaperButton>Light</PaperButton>);
    const button = screen.getByRole('button', { name: 'Light' });
    expect(button.closest('.paperWrap')).not.toBeNull();
  });

  it('renders current links with aria-current', () => {
    render(
      <PaperButton current href="/music" title="Listening history">
        Music
      </PaperButton>,
    );
    expect(screen.getByRole('link', { name: 'Music' })).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    '/api/oauth?provider=spotify',
    '/api/auth/vercel',
    'https://example.com/elsewhere',
  ])('renders %s as a document anchor, not a prefetching router link', (href) => {
    render(
      <PaperButton href={href} title="Connect">
        Connect
      </PaperButton>,
    );
    const link = screen.getByRole('link', { name: 'Connect' });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveClass('paperButton');
  });

  it('keeps app pages on the transition link', () => {
    render(
      <PaperButton href="/music?sort=added" title="Listening history">
        Music
      </PaperButton>,
    );
    expect(screen.getByRole('link', { name: 'Music' })).not.toHaveClass('paperButton');
  });
});
