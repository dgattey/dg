'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import { type ColorSchemePreference, parseColorSchemePreference } from '../theme/colorScheme';
import { useColorScheme } from '../theme/useColorScheme';
import { GlassSwitcher } from './GlassSwitcher';

const ICON_SIZE = 18;

const ICONS: Record<ColorSchemePreference, React.ReactNode> = {
  dark: <Moon size={ICON_SIZE} />,
  light: <Sun size={ICON_SIZE} />,
  system: <Monitor size={ICON_SIZE} />,
} as const;

const LABELS: Record<ColorSchemePreference, string> = {
  dark: 'Use dark color mode',
  light: 'Use light color mode',
  system: 'Use system color mode',
} as const;

const STATIC_OPTIONS = [
  { icon: ICONS.light, label: LABELS.light, value: 'light' },
  { icon: ICONS.dark, label: LABELS.dark, value: 'dark' },
  { icon: ICONS.system, label: LABELS.system, value: 'system' },
];

export function ColorSchemeToggleClient() {
  const { preference, setPreference } = useColorScheme();

  return (
    <GlassSwitcher
      aria-label="Choose color scheme"
      onChange={(value) => setPreference(parseColorSchemePreference(value))}
      options={STATIC_OPTIONS}
      value={preference}
    />
  );
}
