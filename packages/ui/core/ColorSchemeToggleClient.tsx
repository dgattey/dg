'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
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

/**
 * Provides the ability to toggle the page's color scheme between
 * system, light, and dark with glass morphism styling. Prerendered, `mode` is `light`.
 */
export function ColorSchemeToggleClient({ initialValue }: ColorSchemeToggleProps) {
  const { updatePreferredMode, colorScheme } = useColorScheme();
  const isServer = typeof window === 'undefined';

  const options = [
    { icon: ICONS.light, label: LABELS.light, value: 'light' },
    { icon: ICONS.dark, label: LABELS.dark, value: 'dark' },
    { icon: ICONS.system, label: LABELS.system, value: 'system' },
  ];

  // Determine current value: if mode is 'system' then 'system', otherwise the resolved mode
  const currentValue = isServer
    ? initialValue
    : colorScheme.isCustomized
      ? colorScheme.mode
      : 'system';

  const handleChange = (value: string) => {
    updatePreferredMode(value === 'system' ? null : (value as ColorSchemeMode));
  };

  return (
    <GlassSwitcher
      aria-label="Choose color scheme"
      onChange={handleChange}
      options={options}
      value={currentValue}
    />
  );
}
