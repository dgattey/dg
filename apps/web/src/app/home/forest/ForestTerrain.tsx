import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { ForestSpriteDefs, SPRITE_ID, SPRITE_SCALE } from './ForestSprites';
import { type ForestWorld, TILE_SIZE, toTerrainRuns } from './forestMap';
import { FOREST_COLOR_VARS, TERRAIN_FILL } from './forestPalette';

/**
 * The island itself, rendered on the server as one SVG.
 *
 * Rows collapse into horizontal runs before they become rects, mountains get a
 * lit top face where nothing sits above them, and scenery is stamped in row
 * order so trees lower on the map overlap the ones behind them.
 */

const WAVE_PERIOD_MS = 5200;

const terrainSx: SxObject = {
  ...FOREST_COLOR_VARS,
  '@keyframes forestWave': {
    '0%, 100%': { opacity: 0.35, transform: 'translateX(0)' },
    '50%': { opacity: 0.85, transform: `translateX(${TILE_SIZE * 0.18}px)` },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .forest-wave': { animation: 'none', opacity: 0.6 },
  },
  '& .forest-wave': {
    animation: `forestWave ${WAVE_PERIOD_MS}ms ease-in-out infinite`,
  },
  inset: 0,
  position: 'absolute',
};

/** Sparse foam dashes so the ocean is never a flat block of colour. */
function waveDashes(world: ForestWorld) {
  const dashes: Array<{ tileX: number; tileY: number }> = [];
  for (let y = 0; y < world.rows; y += 2) {
    for (let x = (y / 2) % 2 === 0 ? 1 : 3; x < world.columns; x += 4) {
      const kind = world.terrain[y]?.[x];
      if (kind === 'ocean' || kind === 'shallow') {
        dashes.push({ tileX: x, tileY: y });
      }
    }
  }
  return dashes;
}

export function ForestTerrain({ world }: { world: ForestWorld }) {
  const width = world.columns * TILE_SIZE;
  const height = world.rows * TILE_SIZE;
  const runs = toTerrainRuns(world);

  return (
    <Box aria-hidden="true" sx={terrainSx}>
      <svg
        height={height}
        role="presentation"
        shapeRendering="crispEdges"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        xmlns="http://www.w3.org/2000/svg"
      >
        <ForestSpriteDefs />
        {runs.map((run) => (
          <rect
            fill={TERRAIN_FILL[run.kind]}
            height={TILE_SIZE}
            key={`${run.tileY}-${run.tileX}`}
            width={run.length * TILE_SIZE}
            x={run.tileX * TILE_SIZE}
            y={run.tileY * TILE_SIZE}
          />
        ))}
        {runs
          .filter(
            (run) =>
              run.kind === 'mountain' && world.terrain[run.tileY - 1]?.[run.tileX] !== 'mountain',
          )
          .map((run) => (
            <rect
              fill="var(--forest-mountain-cap)"
              height={TILE_SIZE * 0.34}
              key={`cap-${run.tileY}-${run.tileX}`}
              width={run.length * TILE_SIZE}
              x={run.tileX * TILE_SIZE}
              y={run.tileY * TILE_SIZE}
            />
          ))}
        <g fill="var(--forest-surf)">
          {waveDashes(world).map((dash, index) => (
            <rect
              className="forest-wave"
              height={TILE_SIZE * 0.16}
              key={`wave-${dash.tileY}-${dash.tileX}`}
              style={{ animationDelay: `${(index % 7) * (WAVE_PERIOD_MS / 7)}ms` }}
              width={TILE_SIZE * 0.75}
              x={dash.tileX * TILE_SIZE}
              y={dash.tileY * TILE_SIZE + TILE_SIZE * 0.4}
            />
          ))}
        </g>
        <g shapeRendering="auto">
          {world.scenery.map((sprite) => {
            const scale = SPRITE_SCALE[sprite.kind];
            const spriteWidth = TILE_SIZE * scale.width;
            const spriteHeight = TILE_SIZE * scale.height;
            return (
              <use
                height={spriteHeight}
                href={`#${SPRITE_ID[sprite.kind]}`}
                key={`${sprite.tileY}-${sprite.tileX}-${sprite.kind}`}
                width={spriteWidth}
                x={sprite.tileX * TILE_SIZE - (spriteWidth - TILE_SIZE) / 2}
                y={(sprite.tileY + 1) * TILE_SIZE - spriteHeight}
              />
            );
          })}
        </g>
      </svg>
    </Box>
  );
}
