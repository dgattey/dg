/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { Logo } from '../Logo';

describe('Logo', () => {
  it.each(['/', '/redesign'])(
    'renders the collage home logo as a scroll-to-top button at %s',
    (pathname) => {
      jest.mocked(usePathname).mockReturnValue(pathname);
      render(<Logo surface="collage" />);

      expect(screen.getByRole('button', { name: 'dg.' })).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    },
  );

  it('links the collage logo home from the prerendered albums path', () => {
    jest.mocked(usePathname).mockReturnValue('/redesign/music/albums');
    render(<Logo surface="collage" />);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  });
});
