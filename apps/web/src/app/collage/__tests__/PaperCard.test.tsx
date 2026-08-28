/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { PaperButton } from '../PaperButton';
import { PaperCard } from '../PaperCard';

jest.mock('@dg/ui/core/transitions/PageTransitionLink', () => ({
  PageTransitionLink: ({
    children,
    href,
    title,
  }: {
    children: React.ReactNode;
    href: string;
    title: string;
  }) => (
    <a href={href} title={title}>
      {children}
    </a>
  ),
}));

describe('PaperCard', () => {
  it('renders a div when it has no href', () => {
    render(<PaperCard>Hello</PaperCard>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders a link when href is set', () => {
    render(
      <PaperCard href="/music" title="Listening history">
        Hello
      </PaperCard>,
    );
    expect(screen.getByRole('link', { name: 'Listening history' })).toHaveAttribute(
      'href',
      '/music',
    );
  });
});

describe('PaperButton', () => {
  it('renders a native button without href', () => {
    render(<PaperButton>Light</PaperButton>);
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('type', 'button');
  });

  it('marks the current scheme button as pressed', () => {
    render(
      <PaperButton current onClick={() => undefined}>
        Dark
      </PaperButton>,
    );
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
  });
});
