import { Moon, Sun, Monitor } from 'lucide-react';
import { Button, Tooltip } from '@mui/material';
import { useColorScheme } from '../theme/useColorScheme';
import type { ColorSchemeMode } from '../theme/useColorScheme';

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

const TOOLTIP: Record<Mode, string> = {
  light: 'Use light color mode',
  dark: 'Use dark color mode',
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
        size="small"
        aria-label={tooltip}
        onClick={() => {
          updatePreferredMode(mode === 'system' ? null : mode);
        }}
        sx={{
          backgroundColor: (t) => (isInitialized ? t.palette.background.paper : undefined),
          paddingY: 0.75,
          paddingX: 0.25,
          '& svg': {
            transition: (t) => t.transitions.create('transform'),
            transformOrigin: 'center',
          },
          '&:hover svg': {
            transform: mode === 'system' ? undefined : 'rotate(45deg)',
          },
        }}
      >
        {ICONS[mode]}
      </Button>
    </Tooltip>
  );
}
