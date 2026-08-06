/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
}));

jest.mock('@dg/ui/core/transitions/pageScrollMemory', () => ({
  rememberPageOrigin: jest.fn(),
}));

import { HeaderControls } from '../HeaderControls';

describe('HeaderControls', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-color-scheme');
    document.documentElement.style.colorScheme = 'light dark';
  });

  it('keeps the theme and music disclosures mutually exclusive', async () => {
    const user = userEvent.setup();
    render(<HeaderControls />);

    const theme = screen.getByRole('button', { name: 'Color scheme: system' });
    const music = screen.getByRole('button', { name: 'Music' });
    const sharedSurface = music.closest('[data-header-controls]');

    expect(sharedSurface).toBe(theme.closest('[data-header-controls]'));
    expect(music.compareDocumentPosition(theme) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await user.click(theme);
    expect(theme).toHaveAttribute('aria-expanded', 'true');
    expect(music).not.toHaveAttribute('aria-expanded', 'true');

    await user.click(music);
    await waitFor(() => {
      expect(theme).toHaveAttribute('aria-expanded', 'false');
      expect(music).toHaveAttribute('aria-expanded', 'true');
    });
  });

  /**
   * An element with `backdrop-filter` is the backdrop root for its whole subtree,
   * so a panel nested inside the capsule glass would blur the capsule instead of
   * the page — and, hanging below the capsule's box, sample nothing at all.
   */
  it('keeps the capsule glass a sibling of the disclosure panels, never their ancestor', () => {
    render(<HeaderControls />);

    const glass = document.querySelector('[data-capsule-glass]');
    expect(glass).not.toBeNull();
    expect(glass?.childElementCount).toBe(0);

    for (const panel of [
      screen.getByRole('menu', { hidden: true }),
      screen.getByRole('radiogroup', { hidden: true }),
    ]) {
      expect(glass?.contains(panel)).toBe(false);
    }
  });
});
