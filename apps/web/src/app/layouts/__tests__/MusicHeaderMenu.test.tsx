/**
 * @jest-environment jsdom
 */

import { favoriteAlbumsRoute, musicRoute } from '@dg/shared-core/routes/app';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

jest.mock('@dg/ui/core/transitions/pageScrollMemory', () => ({
  rememberPageOrigin: jest.fn(),
}));

import { MusicHeaderMenu } from '../MusicHeaderMenu';

/** Any view-transition-name emitted for this element's generated class. */
function capturedTitleName(element: HTMLElement): string | undefined {
  const matched = [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])].map((rule) => rule.cssText))
    .filter((rule) => [...element.classList].some((className) => rule.includes(`.${className}`)))
    .map((rule) => rule.match(/view-transition-name:\s*([\w-]+)/)?.at(1))
    .filter((name): name is string => Boolean(name));
  return [...new Set(matched)].at(0);
}

function TestMusicHeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  return <MusicHeaderMenu isOpen={isOpen} onOpenChange={setIsOpen} />;
}

describe('MusicHeaderMenu', () => {
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
   * Pairing the disc with `page-title` makes the heading FLIP in from a 48px
   * icon in the northeast header (~1000px, 23×). Leave it unnamed so it stays
   * inside `site-header` and the heading appears in place.
   */
  it('does not name the trigger or menu links for a title morph', async () => {
    const user = userEvent.setup();
    render(<TestMusicHeaderMenu />);

    const trigger = screen.getByRole('button', { name: 'Music' });
    expect(trigger.style.viewTransitionName).toBe('');
    expect(capturedTitleName(trigger)).toBeUndefined();

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
});
