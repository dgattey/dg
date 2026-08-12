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

/**
 * The trigger is a `<summary>`, which `aria-query` has no role mapping for, so
 * `getByRole` cannot reach it however it is spelled. Browsers do expose it — as
 * a button carrying the parent's expanded state — so the element is the contract
 * here and the role query is simply not available to assert it.
 */
function getTrigger(): HTMLElement {
  const trigger = document.querySelector('details > summary');
  if (!(trigger instanceof HTMLElement)) {
    throw new Error('no <summary> trigger rendered');
  }
  return trigger;
}

function getDisclosure(): HTMLDetailsElement {
  const details = document.querySelector('details');
  if (!(details instanceof HTMLDetailsElement)) {
    throw new Error('no <details> disclosure rendered');
  }
  return details;
}

/** Every emitted rule whose selector mentions the given text. */
function rulesMatching(selectorText: string): Array<string> {
  return [...document.querySelectorAll('style')]
    .flatMap((style) => [...(style.sheet?.cssRules ?? [])])
    .filter((rule) => rule.cssText.split('{').at(0)?.includes(selectorText))
    .map((rule) => rule.cssText);
}

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

    const trigger = getTrigger();
    const disclosure = getDisclosure();
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).toHaveAccessibleName('Music');
    expect(disclosure.open).toBe(false);

    await user.click(trigger);
    expect(disclosure.open).toBe(true);

    // Visible, not merely present: the panel is revealed by CSS off `details[open]`
    const menu = screen.getByRole('menu', { name: 'Music' });
    expect(trigger).toHaveAttribute('aria-controls', menu.id);

    const links = screen.getAllByRole('menuitem');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      favoriteAlbumsRoute,
      musicRoute,
    ]);
    expect(links.map((link) => link.textContent)).toEqual(['Favorite albums', 'Listening history']);
  });

  /**
   * The whole point of building on `<details>`: the open state lives on an
   * element the platform toggles itself, and the panel is revealed by a selector
   * rather than by a React render, so both survive scripting being off.
   */
  it('discloses the menu from markup alone, with no state that scripting has to correct', () => {
    render(<TestMusicHeaderMenu />);

    const trigger = getTrigger();
    const menu = screen.getByRole('menu', { hidden: true });
    expect(menu).toHaveAttribute('aria-label', 'Music');

    // A server-rendered `aria-expanded` or `inert` would be frozen at "closed"
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('role');
    expect(menu).not.toHaveAttribute('inert');
    expect(menu).not.toHaveAttribute('aria-hidden');

    const revealRules = rulesMatching(':has(> details[open])');
    expect(revealRules.some((rule) => rule.includes('visibility: visible'))).toBe(true);
    expect(revealRules.some((rule) => rule.includes(`.${menu.className.split(' ').at(-1)}`))).toBe(
      true,
    );
  });

  /**
   * Pairing the disc with `page-title` makes the heading FLIP in from a 48px
   * icon in the northeast header (~1000px, 23×). Leave it unnamed so it stays
   * inside `site-header` and the heading appears in place.
   */
  it('does not name the trigger or menu links for a title morph', async () => {
    const user = userEvent.setup();
    render(<TestMusicHeaderMenu />);

    const trigger = getTrigger();
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

  it('moves focus into the menu on open', async () => {
    const user = userEvent.setup();
    render(<TestMusicHeaderMenu />);

    await user.click(getTrigger());
    expect(screen.getAllByRole('menuitem').at(0)).toHaveFocus();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<TestMusicHeaderMenu />);

    const trigger = getTrigger();
    await user.click(trigger);
    expect(getDisclosure().open).toBe(true);

    await user.keyboard('{Escape}');
    expect(getDisclosure().open).toBe(false);
    expect(trigger).toHaveFocus();
  });

  it('walks the destinations with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<TestMusicHeaderMenu />);

    await user.click(getTrigger());
    const [firstLink, secondLink] = screen.getAllByRole('menuitem');

    await user.keyboard('{ArrowDown}');
    expect(secondLink).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(firstLink).toHaveFocus();
    await user.keyboard('{End}');
    expect(secondLink).toHaveFocus();
    await user.keyboard('{Home}');
    expect(firstLink).toHaveFocus();
  });
});
