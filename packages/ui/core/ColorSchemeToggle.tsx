import { ButtonGroup, Stack } from '@mui/material';
import { ColorSchemeButton } from './ColorSchemeButton';

/**
 * Provides the ability to toggle the page's color scheme between
 * system, light, and dark. Prerendered, `mode` is `light`.
 */
export function ColorSchemeToggle() {
  return (
    <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
      <ButtonGroup aria-label="outlined primary button group" size="small" variant="outlined">
        <ColorSchemeButton mode="light" />
        <ColorSchemeButton mode="dark" />
        <ColorSchemeButton mode="system" />
      </ButtonGroup>
    </Stack>
  );
}
