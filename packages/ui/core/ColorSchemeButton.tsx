import { Button, Tooltip } from '@mui/material';
import { Monitor, Moon, Sun } from 'lucide-react';
import type { ColorSchemeMode } from '../theme/useColorScheme';
import { useColorScheme } from '../theme/useColorScheme';

type Mode = ColorSchemeMode | 'system';

type ColorSchemeButtonProps = {
  /**
   * The color scheme mode to switch to on click
   */
  mode: Mode;
};

const ICON_SIZE = 13;
const DELAY_MS = 200;

const ICONS: Record<Mode, React.ReactNode> = {
  dark: <Moon size={ICON_SIZE} />,
  light: <Sun size={ICON_SIZE} />,
  system: <Monitor size={ICON_SIZE} />,
} as const;

const TOOLTIP: Record<Mode, string> = {
  dark: 'Use dark color mode',
  light: 'Use light color mode',
  system: `Use system color mode`,
} as const;

/**
 * Creates an icon that is clickable to update to a preferred color scheme
 * if we have one that's set already. Otherwise, renders a disabled icon.
 */
export function ColorSchemeButton({ mode }: ColorSchemeButtonProps) {
  const {
    updatePreferredMode,
    colorScheme: { isInitialized },
  } = useColorScheme();
  const tooltip = TOOLTIP[mode];
  return (
    <Tooltip
      enterDelay={DELAY_MS}
      enterNextDelay={DELAY_MS}
      enterTouchDelay={DELAY_MS}
      title={tooltip}
    >
      <Button
        aria-label={tooltip}
        onClick={() => {
          updatePreferredMode(mode === 'system' ? null : mode);
        }}
        size="small"
        sx={{
          '& svg': {
            transformOrigin: 'center',
            transition: (theme) => theme.transitions.create('transform'),
          },
          '&:hover svg': {
            transform: mode === 'system' ? undefined : 'rotate(45deg)',
          },
          backgroundColor: (theme) =>
            isInitialized ? theme.vars.palette.background.paper : undefined,
          paddingX: 0.25,
          paddingY: 0.75,
        }}
      >
        {ICONS[mode]}
      </Button>
    </Tooltip>
  );
}
