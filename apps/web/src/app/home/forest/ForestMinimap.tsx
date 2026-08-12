import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { type ForestWorld, type MinimapKind, toMinimapRuns } from './forestMap';

/**
 * A corner chart of the whole island, so a visitor who can only see their own
 * clearing still knows the shape of the place and where the other stops are.
 *
 * Server-rendered like the map it summarises. The scene moves one marker inside
 * it; nothing else here changes after the first paint.
 */

/** Attribute the scene uses to drive the "you are here" marker. */
export const MINIMAP_MARKER_ROLE = 'forest-minimap-marker';

const MINIMAP_TILE = 3;

const MINIMAP_FILL: Record<MinimapKind, string> = {
  clearing: 'var(--forest-clearing)',
  land: 'var(--forest-grass)',
  peak: 'var(--forest-mountain)',
  trail: 'var(--forest-path)',
  water: 'var(--forest-ocean)',
};

const minimapSx: SxObject = {
  backgroundColor: 'color-mix(in srgb, var(--mui-palette-background-paper) 70%, transparent)',
  border: '1px solid var(--mui-palette-card-border)',
  borderRadius: 3,
  bottom: 12,
  boxShadow: 'var(--mui-extraShadows-card-main)',
  lineHeight: 0,
  padding: 0.5,
  pointerEvents: 'none',
  position: 'absolute',
  right: 12,
  zIndex: 6,
};

export function ForestMinimap({ world }: { world: ForestWorld }) {
  const width = world.columns * MINIMAP_TILE;
  const height = world.rows * MINIMAP_TILE;

  return (
    <Box aria-hidden="true" sx={minimapSx}>
      <svg
        height={height}
        role="presentation"
        shapeRendering="crispEdges"
        viewBox={`0 0 ${world.columns} ${world.rows}`}
        width={width}
        xmlns="http://www.w3.org/2000/svg"
      >
        {toMinimapRuns(world).map((run) => (
          <rect
            fill={MINIMAP_FILL[run.kind]}
            height={1}
            key={`${run.tileY}-${run.tileX}`}
            width={run.length}
            x={run.tileX}
            y={run.tileY}
          />
        ))}
        {world.plots.map((plot) => (
          <rect
            fill="var(--mui-palette-text-primary)"
            height={2}
            key={plot.id}
            opacity={0.55}
            width={2}
            x={plot.tileX - 1}
            y={plot.tileY - 1}
          />
        ))}
        <rect
          data-role={MINIMAP_MARKER_ROLE}
          fill="var(--mui-palette-primary-main)"
          height={3}
          stroke="var(--mui-palette-background-paper)"
          strokeWidth={0.6}
          width={3}
          x={-1.5}
          y={-1.5}
        />
      </svg>
    </Box>
  );
}
