import { Moon, Sun, Monitor } from 'lucide-react';
import type { Theme } from '@mui/material';
import { useColorScheme } from '../theme/useColorScheme';
import type { ColorSchemeMode } from '../theme/useColorScheme';
import { ButtonWithTooltip } from './ButtonWithTooltip';

type Mode = ColorSchemeMode | 'system';

type ColorSchemeButtonProps = {
  /**
   * The color scheme mode to switch to on click
   */
  mode: Mode;
};

const ICON_SIZE = 13;
const DELAY_MS = 200;

const ICONS: Record<Mode, JSX.Element> = {
  light: <Sun size={ICON_SIZE} />,
  dark: <Moon size={ICON_SIZE} />,
  system: <Monitor size={ICON_SIZE} />,
} as const;

function getColor(mode: Mode, theme: Theme) {
  switch (mode) {
    case 'light':
      return theme.vars.palette.warning.main;
    case 'dark':
      return theme.vars.palette.secondary.light;
    case 'system':
      return theme.vars.palette.primary.dark;
  }
}

/**
 * Creates an icon that is clickable to update to a preferred color scheme
 * if we have one that's set already. Otherwise, renders a disabled icon.
 */
export function ColorSchemeButton({ mode }: ColorSchemeButtonProps) {
  const { updatePreferredMode } = useColorScheme();
  const tooltip = (() => {
    switch (mode) {
      case 'light':
        return 'Use light color mode';
      case 'dark':
        return 'Use dark color mode';
      case 'system':
        return `Use system color mode`;
    }
  })();

  return (
    <ButtonWithTooltip
      buttonProps={{
        size: 'small',
        'aria-label': tooltip,
        onClick: () => {
          updatePreferredMode(mode === 'system' ? null : mode);
        },
        sx: (theme) => ({
          paddingY: 0.75,
          paddingX: 0.25,
          '& svg': {
            transition: theme.transitions.create('transform'),
            transformOrigin: 'center',
          },
          '&:hover svg': {
            color: getColor(mode, theme),
            transform: mode === 'system' ? undefined : 'rotate(45deg)',
          },
        }),
      }}
      tooltipProps={{
        enterDelay: DELAY_MS,
        enterNextDelay: DELAY_MS,
        enterTouchDelay: DELAY_MS,
        title: tooltip,
      }}
    >
      {ICONS[mode]}
    </ButtonWithTooltip>
  );
}
