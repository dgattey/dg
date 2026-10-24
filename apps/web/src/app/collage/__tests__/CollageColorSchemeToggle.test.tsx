/**
 * @jest-environment jsdom
 */

import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from '@dg/ui/theme/colorScheme';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollageColorSchemeToggle } from '../CollageColorSchemeToggle';

const mockSystemScheme = (scheme: 'light' | 'dark') => {
  window.matchMedia = jest.fn((query: string) => ({
    addEventListener: jest.fn(),
    matches: query === '(prefers-color-scheme: dark)' && scheme === 'dark',
    media: query,
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
};

describe('CollageColorSchemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it('flips a dark system to light, then back to following the system', async () => {
    const user = userEvent.setup();
    mockSystemScheme('dark');
    render(<CollageColorSchemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');

    await user.click(
      screen.getByRole('button', { name: 'Switch to dark theme, matching your system' }),
    );

    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBeNull();
    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it('flips a light system to dark', async () => {
    const user = userEvent.setup();
    mockSystemScheme('light');
    render(<CollageColorSchemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));

    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark');
    expect(
      screen.getByRole('button', { name: 'Switch to light theme, matching your system' }),
    ).toBeInTheDocument();
  });

  it('treats a stored choice that equals the system as matching it', async () => {
    const user = userEvent.setup();
    mockSystemScheme('dark');
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
    render(<CollageColorSchemeToggle />);

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));

    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('light');
  });
});
