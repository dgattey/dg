/**
 * @jest-environment jsdom
 */

import {
  activitiesRoute,
  favoriteAlbumsRoute,
  musicRoute,
  musicStatsRoute,
  readingRoute,
} from '@dg/shared-core/routes/app';
import { render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

import { CollageMusicLinks } from '../CollageMusicLinks';

describe('CollageMusicLinks', () => {
  it('links Reads and Big map as top-level pills after the Music menu', () => {
    jest.mocked(usePathname).mockReturnValue('/');
    render(<CollageMusicLinks />);

    expect(screen.getByRole('link', { name: 'Reads' })).toHaveAttribute('href', readingRoute);
    expect(screen.getByRole('link', { name: 'Big map' })).toHaveAttribute('href', activitiesRoute);
  });

  it('leads the Music menu with listening stats', () => {
    jest.mocked(usePathname).mockReturnValue('/');
    render(<CollageMusicLinks />);

    expect(
      within(screen.getByRole('list'))
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Listening stats', musicStatsRoute],
      ['Plays', musicRoute],
      ['Favorite albums', favoriteAlbumsRoute],
    ]);
  });

  it.each([
    [readingRoute, 'Reads'],
    [activitiesRoute, 'Big map'],
  ])('marks only the pill for %s as the current page', (pathname, label) => {
    jest.mocked(usePathname).mockReturnValue(pathname);
    render(<CollageMusicLinks />);

    const current = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')
      .map((link) => link.textContent);
    expect(current).toEqual([label]);
  });
});
