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

    await user.click(theme);
    expect(theme).toHaveAttribute('aria-expanded', 'true');
    expect(music).not.toHaveAttribute('aria-expanded', 'true');

    await user.click(music);
    await waitFor(() => {
      expect(theme).toHaveAttribute('aria-expanded', 'false');
      expect(music).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
