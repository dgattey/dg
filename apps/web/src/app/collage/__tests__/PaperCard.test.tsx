/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { PaperButton } from '../PaperButton';

jest.mock('@dg/ui/core/transitions/PageTransitionLink', () => ({
  PageTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('PaperButton', () => {
  it('renders a native button with pressed state', () => {
    render(<PaperButton>Light</PaperButton>);
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders current links with aria-current', () => {
    render(
      <PaperButton current href="/music" title="Listening history">
        Music
      </PaperButton>,
    );
    expect(screen.getByRole('link', { name: 'Music' })).toHaveAttribute('aria-current', 'page');
  });
});
