import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

/**
 * The visitor: a small top-down directional marker.
 *
 * Not a smiling sprite and not a Minecraft head. A hard-shadowed chevron that
 * the scene flips with `data-facing` so movement never re-renders React.
 */

export const CHARACTER_ROLE = 'forest-character';
export const CHARACTER_WIDTH = 18;
export const CHARACTER_HEIGHT = 18;

const characterSx: SxObject = {
  filter: 'none',
  transform: 'translate(-50%, -70%)',
  transformOrigin: 'center center',
};

export function ForestCharacter() {
  return (
    <Box
      aria-hidden="true"
      component="svg"
      data-role={CHARACTER_ROLE}
      height={CHARACTER_HEIGHT}
      sx={characterSx}
      viewBox="0 0 16 16"
      width={CHARACTER_WIDTH}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="9.1" cy="12.6" fill="var(--forest-shadow)" rx="4.4" ry="1.35" />
      <polygon fill="var(--forest-bark-dark)" points="3.2,8.4 8,13.4 12.8,8.4 8,3.2" />
      <polygon fill="var(--forest-steel)" points="3.2,8.4 8,3.2 8,13.4" />
      <polygon fill="var(--forest-brass)" points="8,3.2 12.2,7.2 8,8.6" />
    </Box>
  );
}
