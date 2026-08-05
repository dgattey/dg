import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from '../../theme/colorScheme';
import { ColorSchemeToggleClient } from '../ColorSchemeToggleClient';

const getTrigger = () => screen.getByRole('button', { name: /^color scheme:/i });

const getGroup = () => screen.getByRole('radiogroup', { name: 'Choose color scheme' });

const getOption = (name: string) => within(getGroup()).getByRole('radio', { name });

const openPicker = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(getTrigger());
  await waitFor(() => {
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');
  });
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

  it('collapses to a single button that announces the current scheme', () => {
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    render(<ColorSchemeToggleClient />);

    expect(getTrigger()).toHaveAccessibleName('Color scheme: dark');
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { hidden: true })).toHaveAttribute('inert');
  });

  it('expands to the full scheme list and marks the current one', async () => {
    const user = userEvent.setup();
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    render(<ColorSchemeToggleClient />);
    await openPicker(user);

    const group = getGroup();
    expect(group).not.toHaveAttribute('inert');
    expect(within(group).getAllByRole('radio')).toHaveLength(3);
    await waitFor(() => {
      expect(getOption('Dark')).toBeChecked();
    });
    expect(getOption('Dark')).toHaveFocus();
  });

  it('persists and applies an explicit preference, then collapses', async () => {
    const user = userEvent.setup();

    render(<ColorSchemeToggleClient />);
    await openPicker(user);
    await user.click(getOption('Dark'));

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
      expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark');
    });
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    expect(getTrigger()).toHaveFocus();
    expect(getTrigger()).toHaveAccessibleName('Color scheme: dark');
  });

  it('removes the stored override for system preference', async () => {
    const user = userEvent.setup();
    localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');

    render(<ColorSchemeToggleClient />);
    await openPicker(user);
    await user.click(getOption('System'));

    await waitFor(() => {
      expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
      expect(document.documentElement.style.colorScheme).toBe('light dark');
      expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBeNull();
    });
  });

  it('keeps the in-memory selection when storage is blocked', async () => {
    const user = userEvent.setup();
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError');
    });

    render(<ColorSchemeToggleClient />);
    await openPicker(user);
    await user.click(getOption('Light'));

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');
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
      expect(getTrigger()).toHaveAccessibleName('Color scheme: dark');
    });
  });

  it('moves through the group with arrow keys without collapsing', async () => {
    const user = userEvent.setup();
    document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, 'light');

    render(<ColorSchemeToggleClient />);
    await openPicker(user);
    await user.keyboard('{ArrowDown}');

    await waitFor(() => {
      expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
      expect(getOption('Dark')).toHaveFocus();
    });
    expect(getTrigger()).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{End}');
    await waitFor(() => {
      expect(getOption('System')).toHaveFocus();
    });
    expect(document.documentElement).not.toHaveAttribute(COLOR_SCHEME_ATTRIBUTE);
  });

  it('commits with Enter and returns focus to the trigger', async () => {
    const user = userEvent.setup();

    render(<ColorSchemeToggleClient />);
    await openPicker(user);
    await user.keyboard('{ArrowUp}{Enter}');

    await waitFor(() => {
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });
    expect(getTrigger()).toHaveFocus();
    expect(document.documentElement).toHaveAttribute(COLOR_SCHEME_ATTRIBUTE, 'dark');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();

    render(<ColorSchemeToggleClient />);
    await openPicker(user);
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });
    expect(getTrigger()).toHaveFocus();
  });

  it('closes when pressing outside the picker', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ColorSchemeToggleClient />
        <button type="button">Elsewhere</button>
      </>,
    );
    await openPicker(user);
    await user.click(screen.getByRole('button', { name: 'Elsewhere' }));

    await waitFor(() => {
      expect(getTrigger()).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
