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
import { useState } from 'react';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('@dg/ui/core/transitions/pageScrollMemory', () => ({
  rememberPageOrigin: jest.fn(),
}));

import { usePathname } from 'next/navigation';
import { MusicHeaderMenu } from '../MusicHeaderMenu';

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

/**
 * The trigger's name is scoped to a navigation capture rather than set on the
 * element, so it is absent at rest and only visible in the emitted rule.
 */
function capturedTitleName(element: HTMLElement): string | undefined {
  const matched = [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .filter(
      (rule) =>
        rule.includes('active-view-transition-type') &&
        [...element.classList].some((className) => rule.includes(`.${className}`)),
    )
    .map((rule) => rule.match(/view-transition-name:\s*([\w-]+)/)?.at(1))
    .filter((name): name is string => Boolean(name));
  return [...new Set(matched)].at(0);
}

function TestMusicHeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  return <MusicHeaderMenu isOpen={isOpen} onOpenChange={setIsOpen} />;
}

describe('MusicHeaderMenu', () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  it('opens a shared glass menu with both music destinations in order', async () => {
    const user = userEvent.setup();
    render(<TestMusicHeaderMenu />);

    const trigger = screen.getByRole('button', { name: 'Music' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).not.toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: 'Music' })).toBeInTheDocument();

    const links = screen.getAllByRole('menuitem');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      favoriteAlbumsRoute,
      musicRoute,
    ]);
    expect(links.map((link) => link.textContent)).toEqual(['Favorite albums', 'Listening history']);
  });

  /**
   * A name held at rest also lifts the trigger out of same-page transitions,
   * whose `page-title-slot` snapshots are blanked — that made the disc vanish
   * for the length of every album well open and close.
   */
  it('names the trigger only for a navigation capture, never at rest', async () => {
    const user = userEvent.setup();
    mockUsePathname.mockReturnValue('/');
    render(<TestMusicHeaderMenu />);

    const trigger = screen.getByRole('button', { name: 'Music' });
    expect(trigger.style.viewTransitionName).toBe('');
    expect(capturedTitleName(trigger)).toBe(PAGE_TITLE_VIEW_TRANSITION_NAME);

    await user.click(trigger);
    const menuLinks = screen.getAllByRole('menuitem');
    expect(menuLinks).toHaveLength(2);
    for (const link of menuLinks) {
      expect(link.style.viewTransitionName).toBe('');
      expect(capturedTitleName(link)).toBeUndefined();
    }
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<TestMusicHeaderMenu />);

    const trigger = screen.getByRole('button', { name: 'Music' });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('switches the trigger to the slot name on either music destination', () => {
    mockUsePathname.mockReturnValue(musicRoute);
    const { rerender } = render(<TestMusicHeaderMenu />);

    for (const path of [musicRoute, favoriteAlbumsRoute, `${favoriteAlbumsRoute}/album123`]) {
      mockUsePathname.mockReturnValue(path);
      rerender(<TestMusicHeaderMenu />);
      const trigger = screen.getByRole('button', { name: 'Music' });
      expect(trigger.style.viewTransitionName).toBe('');
      expect(capturedTitleName(trigger)).toBe(PAGE_TITLE_SLOT_VIEW_TRANSITION_NAME);
    }
  });
});
