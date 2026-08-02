/**
 * @jest-environment jsdom
 */

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import {
  PAGE_TITLE_SLOT_VIEW_TRANSITION_NAME,
  PAGE_TITLE_VIEW_TRANSITION_NAME,
} from '@dg/ui/core/transitions/pageTransitions';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('@dg/ui/core/transitions/pageScrollMemory', () => ({
  rememberPageOrigin: jest.fn(),
}));

import { usePathname } from 'next/navigation';
import { MusicFooterMenu } from '../MusicFooterMenu';
import { isFavoriteAlbumsFooterUrl } from '../musicFooterDestinations';

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

describe('MusicFooterMenu', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('opens a menu with both music destinations in order', async () => {
    const user = userEvent.setup();
    render(<MusicFooterMenu icon="albums" />);

    const trigger = screen.getByRole('button', { name: 'Music' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).not.toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      favoriteAlbumsRoute,
      musicRoute,
    ]);
    expect(links.map((link) => link.textContent)).toEqual(['Favorite albums', 'Listening history']);
  });

  it('gives only the trigger the page-title name while the menu is open', async () => {
    const user = userEvent.setup();
    mockUsePathname.mockReturnValue('/');
    render(<MusicFooterMenu icon="albums" />);

    const trigger = screen.getByRole('button', { name: 'Music' });
    expect(trigger.style.viewTransitionName).toBe(PAGE_TITLE_VIEW_TRANSITION_NAME);

    await user.click(trigger);
    const menuLinks = screen.getAllByRole('link');
    expect(menuLinks).toHaveLength(2);
    for (const link of menuLinks) {
      expect(link.style.viewTransitionName).toBe('');
    }

    const named = [trigger, ...menuLinks].filter(
      (element) => element.style.viewTransitionName === PAGE_TITLE_VIEW_TRANSITION_NAME,
    );
    expect(named).toHaveLength(1);
  });

  it('switches the trigger to the slot name on either music destination', () => {
    mockUsePathname.mockReturnValue(musicRoute);
    const { rerender } = render(<MusicFooterMenu icon="albums" />);
    expect(screen.getByRole('button', { name: 'Music' }).style.viewTransitionName).toBe(
      PAGE_TITLE_SLOT_VIEW_TRANSITION_NAME,
    );

    mockUsePathname.mockReturnValue(favoriteAlbumsRoute);
    rerender(<MusicFooterMenu icon="albums" />);
    expect(screen.getByRole('button', { name: 'Music' }).style.viewTransitionName).toBe(
      PAGE_TITLE_SLOT_VIEW_TRANSITION_NAME,
    );
  });

  it('recognizes favorite-albums footer URLs with a trailing slash', () => {
    expect(isFavoriteAlbumsFooterUrl(favoriteAlbumsRoute)).toBe(true);
    expect(isFavoriteAlbumsFooterUrl(`${favoriteAlbumsRoute}/`)).toBe(true);
    expect(isFavoriteAlbumsFooterUrl(musicRoute)).toBe(false);
  });
});
