/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { Logo } from '../Logo';

describe('Logo', () => {
  it.each(['', '/', '/redesign', '/redesign/music/albums'])(
    'always renders the collage logo as a home link at %s to avoid hydration mismatches',
    (pathname) => {
      jest.mocked(usePathname).mockReturnValue(pathname);
      render(<Logo surface="collage" />);

      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    },
  );

  it.each(['/', '/redesign'])(
    'scrolls to top instead of navigating when clicking the home logo at %s',
    async (pathname) => {
      const user = userEvent.setup();
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
      jest.mocked(usePathname).mockReturnValue(pathname);
      render(<Logo surface="collage" />);

      await user.click(screen.getByRole('link', { name: 'Home' }));

      expect(scrollToSpy).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 });
      scrollToSpy.mockRestore();
    },
  );

  it.each(['', '/', '/music'])(
    'always renders the classic logo as a home link at %s to avoid hydration mismatches',
    (pathname) => {
      jest.mocked(usePathname).mockReturnValue(pathname);
      render(<Logo surface="classic" />);

      expect(screen.getByRole('link', { name: 'dg.' })).toHaveAttribute('href', '/');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    },
  );
});
