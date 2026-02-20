'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ColorSchemeMode } from '../theme/useColorScheme';
import { useColorScheme } from '../theme/useColorScheme';
import { GlassSwitcher } from './GlassSwitcher';

type Mode = ColorSchemeMode | 'system';

const ICON_SIZE = 18;

const ICONS: Record<Mode, React.ReactNode> = {
  dark: <Moon size={ICON_SIZE} />,
  light: <Sun size={ICON_SIZE} />,
  system: <Monitor size={ICON_SIZE} />,
} as const;

const LABELS: Record<Mode, string> = {
  dark: 'Use dark color mode',
  light: 'Use light color mode',
  system: 'Use system color mode',
} as const;

type ColorSchemeToggleProps = {
  initialValue: 'dark' | 'light' | 'system';
};

const STATIC_OPTIONS = [
  { icon: ICONS.light, label: LABELS.light, value: 'light' },
  { icon: ICONS.dark, label: LABELS.dark, value: 'dark' },
  { icon: ICONS.system, label: LABELS.system, value: 'system' },
];

const noop = () => {};

/**
 * Non-interactive fallback for Suspense boundaries. Renders the same
 * GlassSwitcher visual with "system" selected but without the color
 * scheme hook that causes suspension.
 */
export function ColorSchemeToggleFallback() {
  return (
    <GlassSwitcher
      aria-label="Choose color scheme"
      onChange={noop}
      options={STATIC_OPTIONS}
      value="system"
    />
  );
}

/**
 * Provides the ability to toggle the page's color scheme between
 * system, light, and dark with glass morphism styling. Prerendered, the
 * toggle starts from the provided initial value for SSR consistency.
 */
export function ColorSchemeToggleClient({ initialValue }: ColorSchemeToggleProps) {
  const { updatePreferredMode, colorScheme } = useColorScheme();
  const [currentValue, setCurrentValue] = useState<Mode>(initialValue);

  // Determine current value: if mode is 'system' then 'system', otherwise the resolved mode
  useEffect(() => {
    const nextValue: Mode = colorScheme.isCustomized ? colorScheme.mode : 'system';
    setCurrentValue((previousValue) => (previousValue === nextValue ? previousValue : nextValue));
  }, [colorScheme.isCustomized, colorScheme.mode]);

  const handleChange = (value: string) => {
    if (value === 'system') {
      setCurrentValue('system');
      updatePreferredMode(null);
      return;
    }
    if (value === 'dark' || value === 'light') {
      setCurrentValue(value);
      updatePreferredMode(value);
    }
  };

  return (
    <GlassSwitcher
      aria-label="Choose color scheme"
      onChange={handleChange}
      options={STATIC_OPTIONS}
      value={currentValue}
    />
  );
}
