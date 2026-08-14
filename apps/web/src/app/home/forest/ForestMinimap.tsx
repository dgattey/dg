import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { type ForestWorld, MINIMAP_MARKER_ROLE } from './forestMap';
import { hudSurfaceSx } from './forestMaterials';
import { forestMinimapDataUrls } from './forestTerrainBitmap';

/**
 * A corner chart of the whole island, so a visitor who can only see their own
 * clearing still knows the shape of the place and where the other stops are.
 *
 * Server-rendered like the map it summarises. The scene moves one marker inside
 * it with a compositor transform; nothing else here changes after the first paint.
 */

const MINIMAP_TILE = 3;

const minimapSx: SxObject = {
  ...hudSurfaceSx,
  '@media (max-height: 560px), (max-width: 420px)': {
    bottom: 8,
    maxWidth: 'min(26vw, 11vh)',
    padding: 0.25,
    right: 8,
  },
  '& [data-forest-minimap-map]': { height: 'auto', maxWidth: '100%', width: '100%' },
  bottom: 16,
  lineHeight: 0,
  maxWidth: 'min(22vw, 14vh)',
  padding: 0.75,
  pointerEvents: 'none',
  position: 'absolute',
  right: 16,
  zIndex: 6,
};

const mapSx = (light: string, dark: string, width: number, height: number): SxObject => ({
  aspectRatio: `${width} / ${height}`,
  backgroundImage: `light-dark(url("${light}"), url("${dark}"))`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  display: 'block',
  imageRendering: 'pixelated',
  overflow: 'hidden',
  position: 'relative',
  width: width * MINIMAP_TILE,
});

const plotSx = (tileX: number, tileY: number, columns: number, rows: number): SxObject => ({
  backgroundColor: 'var(--mui-palette-text-primary)',
  height: `${(2 / rows) * 100}%`,
  left: `${((tileX - 1) / columns) * 100}%`,
  opacity: 0.55,
  position: 'absolute',
  top: `${((tileY - 1) / rows) * 100}%`,
  width: `${(2 / columns) * 100}%`,
});

const markerTrackSx: SxObject = {
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
  willChange: 'transform',
};

const markerDotSx: SxObject = {
  backgroundColor: 'var(--mui-palette-primary-main)',
  boxShadow: '0 0 0 1px var(--mui-palette-background-paper)',
  height: 9,
  left: 0,
  position: 'absolute',
  top: 0,
  transform: 'translate(-50%, -50%)',
  width: 9,
};

export function ForestMinimap({ world }: { world: ForestWorld }) {
  const bitmap = forestMinimapDataUrls(world);
  const spawnX = (world.spawn.tileX / world.columns) * 100;
  const spawnY = (world.spawn.tileY / world.rows) * 100;

  return (
    <Box aria-hidden="true" sx={minimapSx}>
      <Box
        data-forest-minimap-map=""
        sx={mapSx(bitmap.light, bitmap.dark, bitmap.width, bitmap.height)}
      >
        {world.plots.map((plot) => (
          <Box key={plot.id} sx={plotSx(plot.tileX, plot.tileY, world.columns, world.rows)} />
        ))}
        <Box
          data-role={MINIMAP_MARKER_ROLE}
          style={{ transform: `translate3d(${spawnX}%, ${spawnY}%, 0)` }}
          sx={markerTrackSx}
        >
          <Box sx={markerDotSx} />
        </Box>
      </Box>
    </Box>
  );
}
