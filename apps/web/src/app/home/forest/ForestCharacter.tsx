import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

/**
 * The visitor: a small blocky walker drawn with rects.
 *
 * The scene flips and bobs it by setting `data-facing` / `data-walking` on the
 * anchor around it, so movement never re-renders React.
 */

export const CHARACTER_ROLE = 'forest-character';
export const CHARACTER_WIDTH = 26;
export const CHARACTER_HEIGHT = 40;

const characterSx: SxObject = {
  filter: 'drop-shadow(0 2px 3px light-dark(hsl(140deg 24% 24% / 0.35), hsl(190deg 60% 4% / 0.6)))',
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
      shapeRendering="crispEdges"
      sx={characterSx}
      viewBox="0 0 13 20"
      width={CHARACTER_WIDTH}
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="6.5" cy="19.2" fill="var(--forest-shadow)" rx="4.6" ry="1.2" />
      <rect
        fill="light-dark(hsl(220deg 24% 34%), hsl(220deg 18% 22%))"
        height="4"
        width="2"
        x="4"
        y="14"
      />
      <rect
        fill="light-dark(hsl(220deg 24% 34%), hsl(220deg 18% 22%))"
        height="4"
        width="2"
        x="7"
        y="14"
      />
      <rect
        fill="light-dark(hsl(24deg 30% 22%), hsl(24deg 20% 16%))"
        height="1.4"
        width="2.6"
        x="3.7"
        y="17.6"
      />
      <rect
        fill="light-dark(hsl(24deg 30% 22%), hsl(24deg 20% 16%))"
        height="1.4"
        width="2.6"
        x="6.7"
        y="17.6"
      />
      <rect fill="var(--mui-palette-primary-main)" height="6" width="7" x="3" y="8" />
      <rect fill="var(--mui-palette-primary-light)" height="6" width="2" x="3" y="8" />
      <rect
        fill="light-dark(hsl(28deg 46% 76%), hsl(28deg 34% 66%))"
        height="2.4"
        width="1.6"
        x="1.6"
        y="9"
      />
      <rect
        fill="light-dark(hsl(28deg 46% 76%), hsl(28deg 34% 66%))"
        height="2.4"
        width="1.6"
        x="9.8"
        y="9"
      />
      <rect
        fill="light-dark(hsl(28deg 52% 80%), hsl(28deg 38% 70%))"
        height="5"
        width="6.4"
        x="3.3"
        y="3.2"
      />
      <rect
        fill="light-dark(hsl(20deg 44% 28%), hsl(20deg 34% 22%))"
        height="2.2"
        width="7.4"
        x="2.8"
        y="1.6"
      />
      <rect
        fill="light-dark(hsl(20deg 44% 28%), hsl(20deg 34% 22%))"
        height="1.6"
        width="1.6"
        x="2.8"
        y="3.6"
      />
      <rect
        fill="light-dark(hsl(200deg 30% 22%), hsl(200deg 24% 14%))"
        height="0.9"
        width="0.9"
        x="5.1"
        y="5"
      />
      <rect
        fill="light-dark(hsl(200deg 30% 22%), hsl(200deg 24% 14%))"
        height="0.9"
        width="0.9"
        x="7.4"
        y="5"
      />
    </Box>
  );
}
