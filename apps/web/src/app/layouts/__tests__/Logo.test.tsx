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
  it.each(['', '/', '/music', '/music/albums'])(
    'always renders the logo as a home link at %s to avoid hydration mismatches',
    (pathname) => {
      jest.mocked(usePathname).mockReturnValue(pathname);
      render(<Logo />);

      expect(screen.getByRole('link', { name: 'dg.' })).toHaveAttribute('href', '/');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    },
  );

  it('scrolls to top instead of navigating when clicking the home logo at /', async () => {
    const user = userEvent.setup();
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    jest.mocked(usePathname).mockReturnValue('/');
    render(<Logo />);

    await user.click(screen.getByRole('link', { name: 'dg.' }));

    expect(scrollToSpy).toHaveBeenCalledWith({ behavior: 'smooth', top: 0 });
    scrollToSpy.mockRestore();
  });

  it('draws the mark as outlines on a die-cut mat instead of system-font text', () => {
    jest.mocked(usePathname).mockReturnValue('/');
    render(<Logo />);

    const mark = screen.getByRole('img', { name: 'dg.' });
    expect(mark.tagName.toLowerCase()).toBe('svg');
    expect(mark.querySelectorAll('g > path')).toHaveLength(3);
    expect(mark.querySelectorAll(':scope > path')).toHaveLength(3);
  });
});
