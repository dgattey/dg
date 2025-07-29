import { ButtonGroup, Stack } from '@mui/material';
import { ColorSchemeButton } from './ColorSchemeButton';

/**
 * Provides the ability to toggle the page's color scheme between
 * system, light, and dark. Prerendered, `mode` is `light`.
 */
export function ColorSchemeToggle() {
  return (
    <Stack sx={{ alignItems: 'center', flexDirection: 'row' }}>
      <ButtonGroup aria-label="outlined primary button group" size="small">
        <ColorSchemeButton mode="light" />
        <ColorSchemeButton mode="dark" />
        <ColorSchemeButton mode="system" />
      </ButtonGroup>
    </Stack>
  );
}
