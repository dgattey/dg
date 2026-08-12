import { render, waitFor } from '@testing-library/react';
import { ColorSchemeSync } from '../ColorSchemeSync';
import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from '../colorScheme';

describe('ColorSchemeSync', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it('restores a stored preference that was stripped off the root', () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');

    render(<ColorSchemeSync />);

    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
  });

  it('restores it again after a strip that no render accompanies', async () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'light');
    render(<ColorSchemeSync />);

    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');
    });
  });

  it('leaves a scheme the user just chose alone', async () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'light');
    render(<ColorSchemeSync />);

    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
    });
  });

  it('stops repairing once unmounted', async () => {
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
    const { unmount } = render(<ColorSchemeSync />);

    unmount();
    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it('leaves the root untouched without a stored preference', () => {
    render(<ColorSchemeSync />);

    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
  });
});
