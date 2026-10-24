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
    expect(screen.getByRole('link', { name: 'Big map' })).toHaveAttribute('href', activitiesRoute);
  });

  it('puts every link in one strip, highlighting the Music segment on a music page', () => {
    const { container } = render(<CollageMusicLinks />);

    const strip = container.querySelector('.chrome__strip');
    expect(strip).not.toBeNull();
    expect(strip?.querySelectorAll('.chrome__segment')).toHaveLength(3);
    expect(screen.getByText('Music').closest('summary')).toHaveClass('chrome__segmentCurrent');
    expect(screen.getByRole('link', { name: 'Reads' })).not.toHaveAttribute('aria-current');
  });

  it('highlights a link segment on its own page', () => {
    jest.mocked(usePathname).mockReturnValue(readingRoute);
    render(<CollageMusicLinks />);

    const reads = screen.getByRole('link', { name: 'Reads' });
    expect(reads).toHaveAttribute('aria-current', 'page');
    expect(reads).toHaveClass('chrome__segmentCurrent');
    expect(screen.getByText('Music').closest('summary')).not.toHaveClass('chrome__segmentCurrent');
  });

  it('renders custom Contentful menu and link items in Contentful order', () => {
    render(
      <CollageMusicLinks
        items={[
          {
            kind: 'link',
            link: { icon: 'reading', title: 'Shelf', url: readingRoute },
          },
          {
            kind: 'menu',
            links: [
              { icon: 'albums', title: 'Favorite albums', url: favoriteAlbumsRoute },
              { icon: 'stats', title: 'Listening stats', url: musicStatsRoute },
            ],
            slug: 'header-music',
            title: 'Tunes',
          },
        ]}
      />,
    );

    const shelfLink = screen.getByRole('link', { name: 'Shelf' });
    const tunesSummary = screen.getByText('Tunes');
    expect(
      shelfLink.compareDocumentPosition(tunesSummary) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const musicList = document.querySelector('.chrome__musicList');
    if (!musicList) {
      throw new Error('Music dropdown list not found');
    }
    expect(
      within(musicList as HTMLElement)
        .getAllByRole('link', { hidden: true })
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['Favorite albums', favoriteAlbumsRoute],
      ['Listening stats', musicStatsRoute],
    ]);
  });
});
