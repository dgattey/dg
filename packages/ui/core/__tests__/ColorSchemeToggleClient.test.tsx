import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from '../../theme/colorScheme';
import { ColorSchemeToggleClient } from '../ColorSchemeToggleClient';

const findRadioByValue = (value: string) => {
  const radios = screen.getAllByRole('radio', { hidden: true });
  const match = radios.find(
    (radio): radio is HTMLInputElement =>
      radio instanceof HTMLInputElement && radio.value === value,
  );
  if (!match) {
    throw new Error(`Radio option "${value}" not found`);
  }
  return match;
};

describe('ColorSchemeToggleClient', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(COLOR_SCHEME_ATTRIBUTE);
    document.documentElement.style.colorScheme = 'light dark';
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reads an explicit preference from the root attribute', async () => {
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    render(<ColorSchemeToggleClient />);

    await waitFor(() => {
      expect(findRadioByValue('dark')).toBeChecked();
    });
  });

  it('persists and applies an explicit preference', async () => {
    const user = userEvent.setup();

    render(<ColorSchemeToggleClient />);

    await user.click(findRadioByValue('dark'));
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark');
      expect(findRadioByValue('dark')).toBeChecked();
    });
  });

  it('removes the stored override for system preference', async () => {
    const user = userEvent.setup();
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    render(<ColorSchemeToggleClient />);

    await user.click(findRadioByValue('system'));
    await waitFor(() => {
      expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
      expect(document.documentElement.style.colorScheme).toBe('light dark');
      expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBeNull();
      expect(findRadioByValue('system')).toBeChecked();
    });
  });

  it('keeps the in-memory selection when storage is blocked', async () => {
    const user = userEvent.setup();
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    render(<ColorSchemeToggleClient />);

    await user.click(findRadioByValue('light'));
    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');
      expect(findRadioByValue('light')).toBeChecked();
    });
  });

  it('applies cross-tab storage updates', async () => {
    render(<ColorSchemeToggleClient />);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: COLOR_SCHEME_STORAGE_KEY,
        newValue: 'dark',
      }),
    );

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
      expect(findRadioByValue('dark')).toBeChecked();
    });
  });
});
