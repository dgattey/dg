import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

/**
 * The visitor: a small clean figure.
 *
 * No smiling face, no Minecraft head, no slag chevron. A simple body and head
 * the scene flips with `data-facing` so movement never re-renders React.
 */

export const CHARACTER_ROLE = 'forest-character';
export const CHARACTER_WIDTH = 20;
export const CHARACTER_HEIGHT = 28;

const characterSx: SxObject = {
  filter: 'drop-shadow(0 2px 2px var(--forest-shadow))',
  transform: 'translate(-50%, -100%)',
  transformOrigin: 'bottom center',
};

export function ForestCharacter() {
  return (
    <Box
      aria-hidden="true"
      component="svg"
      data-role={CHARACTER_ROLE}
      height={CHARACTER_HEIGHT}
      sx={characterSx}
      viewBox="0 0 12 18"
      width={CHARACTER_WIDTH}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="6" cy="16.8" fill="var(--forest-shadow)" rx="3.6" ry="1" />
      <rect fill="var(--forest-bark-dark)" height="3.4" rx="0.7" width="1.7" x="3.2" y="12.4" />
      <rect fill="var(--forest-bark-dark)" height="3.4" rx="0.7" width="1.7" x="7.1" y="12.4" />
      <rect fill="var(--forest-lake)" height="5.4" rx="1.6" width="5.6" x="3.2" y="7.2" />
      <rect fill="var(--forest-shallow)" height="5.4" rx="1.6" width="2" x="3.2" y="7.2" />
      <circle cx="6" cy="4.4" fill="var(--forest-sand)" r="2.35" />
    </Box>
  );
}
