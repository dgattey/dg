import { ColorSchemeContext } from 'components/ColorSchemeContext';
import { useContext } from 'react';
import { Stack, Switch } from '@mui/material';
import { ColorSchemeIcon } from 'components/ColorSchemeIcon';

const HEIGHT_PX = 24;
const WIDTH_PX = 48;
const PADDING = 0.5;
const PADDING_PX = PADDING * 8;
const TRACK_SIZE_PX = HEIGHT_PX - 2 * PADDING_PX;

/**
 * Provides the ability to toggle the page's color scheme between
 * system, light, and dark. Prerendered, `mode` is `light`.
 */
export function ColorSchemeToggle() {
  const { colorScheme, updatePreferredMode } = useContext(ColorSchemeContext);
  const setInvertedScheme = () =>
    updatePreferredMode(colorScheme.mode === 'dark' ? 'light' : 'dark');

  return (
    <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
      <ColorSchemeIcon mode="light" />
      <Switch
        onChange={setInvertedScheme}
        checked={colorScheme.isInitialized && colorScheme.mode === 'dark'}
        value={colorScheme.isInitialized ? colorScheme.mode : ''}
        aria-label="Change color scheme mode"
        aria-hidden
        tabIndex={-1}
        sx={(theme) => ({
          height: HEIGHT_PX,
          width: WIDTH_PX,
          margin: 0,
          padding: 0,

          '& .Mui-focusVisible': {
            outlineColor: '-webkit-focus-ring-color',
            outlineStyle: 'solid',
            outlineWidth: 'medium',
          },
          '&& .MuiSwitch-switchBase': {
            margin: PADDING,
            padding: 0,

            '&.Mui-checked': {
              transform: `translateX(${WIDTH_PX - TRACK_SIZE_PX - 2 * PADDING_PX}px)`,
              '&& + .MuiSwitch-track': {
                opacity: 1,
                backgroundColor: colorScheme.isCustomized
                  ? theme.palette.active.main
                  : theme.palette.card.border,
              },
            },
          },
          '& .MuiSwitch-input': {
            width: WIDTH_PX * 2 + TRACK_SIZE_PX,
            height: HEIGHT_PX,
            left: -WIDTH_PX - TRACK_SIZE_PX / 2,
            top: -PADDING_PX,
          },
          '& .MuiSwitch-thumb': {
            backgroundColor: theme.palette.common.white,
            width: TRACK_SIZE_PX,
            height: TRACK_SIZE_PX,
          },
          '&& .MuiSwitch-track': {
            opacity: 1,
            backgroundColor: colorScheme.isCustomized
              ? theme.palette.active.main
              : theme.palette.card.border,
            borderRadius: HEIGHT_PX / 2,
            transition: theme.transitions.create('background-color'),
          },
        })}
      />
      <ColorSchemeIcon mode="dark" />
    </Stack>
  );
}
