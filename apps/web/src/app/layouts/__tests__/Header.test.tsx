/**
 * @jest-environment jsdom
 */

import {
  favoriteAlbumsRoute,
  musicRoute,
  musicStatsRoute,
  readingRoute,
  stravaRoute,
} from '@dg/shared-core/routes/app';
import { render, screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { CollageMusicLinks } from '../CollageMusicLinks';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/music/stats'),
}));

describe('Header navigation (CollageMusicLinks)', () => {
  beforeEach(() => {
    jest.mocked(usePathname).mockReturnValue('/music/stats');
  });

  it('orders the Music dropdown with Listening stats first, then Plays, then Favorite albums, followed by Reads and Big map', () => {
    const { container } = render(<CollageMusicLinks />);

    const musicList = container.querySelector('.chrome__musicList');
    if (!musicList) {
      throw new Error('Music dropdown list not found');
    }

    expect(
      within(musicList as HTMLElement)
        .getAllByRole('link', { hidden: true })
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Listening stats', musicStatsRoute],
      ['Plays', musicRoute],
      ['Favorite albums', favoriteAlbumsRoute],
    ]);

    expect(screen.getByRole('link', { name: 'Reads' })).toHaveAttribute('href', readingRoute);
    expect(screen.getByRole('link', { name: 'Big map' })).toHaveAttribute('href', stravaRoute);
  });
});
