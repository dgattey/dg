import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeToggleClient } from '../ColorSchemeToggleClient';

const mockUseColorScheme = jest.fn();

jest.mock('../../theme/useColorScheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

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
  afterEach(() => {
    mockUseColorScheme.mockReset();
  });

  it('uses customized mode on the client', () => {
    mockUseColorScheme.mockReturnValue({
      colorScheme: {
        isCustomized: true,
        isInitialized: true,
        mode: 'dark',
      },
      updatePreferredMode: jest.fn(),
    });

    render(<ColorSchemeToggleClient initialValue="light" />);

    return waitFor(() => {
      const darkRadio = findRadioByValue('dark');
      expect(darkRadio).toBeChecked();
    });
  });

  it('maps non-system values to preferred mode', async () => {
    const user = userEvent.setup();
    const updatePreferredMode = jest.fn();
    mockUseColorScheme.mockReturnValue({
      colorScheme: {
        isCustomized: true,
        isInitialized: true,
        mode: 'light',
      },
      updatePreferredMode,
    });

    render(<ColorSchemeToggleClient initialValue="light" />);

    await user.click(findRadioByValue('dark'));
    expect(updatePreferredMode).toHaveBeenCalledWith('dark');
  });

  it('maps system to a null preferred mode', async () => {
    const user = userEvent.setup();
    const updatePreferredMode = jest.fn();
    mockUseColorScheme.mockReturnValue({
      colorScheme: {
        isCustomized: true,
        isInitialized: true,
        mode: 'dark',
      },
      updatePreferredMode,
    });

    render(<ColorSchemeToggleClient initialValue="light" />);

    await user.click(findRadioByValue('system'));
    expect(updatePreferredMode).toHaveBeenCalledWith(null);
  });

  it('uses initialValue on the server', () => {
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const canWriteWindow =
      windowDescriptor?.writable === true || typeof windowDescriptor?.set === 'function';
    if (!canWriteWindow) {
      return;
    }

    const originalWindow = globalThis.window;
    Reflect.set(globalThis, 'window', undefined);
    try {
      const updatePreferredMode = jest.fn();
      mockUseColorScheme.mockReturnValue({
        colorScheme: {
          isCustomized: true,
          isInitialized: true,
          mode: 'dark',
        },
        updatePreferredMode,
      });

      render(<ColorSchemeToggleClient initialValue="light" />);

      const lightRadio = findRadioByValue('light');
      expect(lightRadio).toBeChecked();
    } finally {
      Reflect.set(globalThis, 'window', originalWindow);
    }
  });
});
