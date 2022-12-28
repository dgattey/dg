import { ColorSchemeMode, useColorScheme } from 'hooks/useColorScheme';
import { Moon, Sun, RefreshCw } from 'lucide-react';
import { Box, IconButton, Theme, Tooltip } from '@mui/material';

interface ColorSchemeIconProps {
  /**
   * The color scheme mode to switch to on click
   */
  mode: ColorSchemeMode;
}

/**
 * Tooltips for the different states
 */
const TOOLTIPS: Record<ColorSchemeMode | 'reset', string> = {
  light: 'Turn on light mode',
  dark: 'Enter dark mode',
  reset: 'Reset to system color mode',
} as const;

const ICON_SIZE = 16;
const DELAY_MS = 300;

/**
 * Creates an icon that is clickable to update to a preferred color scheme
 * if we have one that's set already. Otherwise, renders a disabled icon.
 */
export function ColorSchemeIcon({ mode }: ColorSchemeIconProps) {
  const { colorScheme, updatePreferredMode } = useColorScheme();
  const isCurrentMode = mode === colorScheme.mode;
  const isResetMode = colorScheme.isCustomized && isCurrentMode;

  const icon = isResetMode ? (
    <RefreshCw size={ICON_SIZE} />
  ) : mode === 'dark' ? (
    <Moon size={ICON_SIZE} />
  ) : (
    <Sun size={ICON_SIZE} />
  );
  const iconColor = (theme: Theme) => {
    if (isResetMode) {
      return theme.palette.text.secondary;
    }
    return mode === 'dark' ? theme.palette.secondary.light : theme.palette.warning.main;
  };

  const updateMode = colorScheme.isInitialized ? () => updatePreferredMode(mode) : undefined;
  const resetMode = colorScheme.isInitialized ? () => updatePreferredMode(null) : undefined;

  const tooltip = TOOLTIPS[isResetMode ? 'reset' : mode];

  return (
    <Tooltip
      title={tooltip}
      enterDelay={DELAY_MS}
      enterTouchDelay={DELAY_MS}
      enterNextDelay={DELAY_MS}
    >
      <span>
        <IconButton
          onClick={isResetMode ? resetMode : updateMode}
          disabled={!colorScheme.isInitialized}
          aria-label={tooltip}
          sx={(theme) => ({
            '& svg': {
              transition: theme.transitions.create('transform'),
              transformOrigin: 'center',
            },
            '&:hover svg': { transform: 'rotate(45deg)' },
            '&:focus-visible': {
              outline: '-webkit-focus-ring-color auto 1px',
            },
          })}
        >
          <Box sx={(theme) => ({ color: iconColor(theme), display: 'flex' })}>{icon}</Box>
        </IconButton>
      </span>
    </Tooltip>
  );
}
