import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import {
  CRITTER_ID,
  CRITTER_SCALE,
  ForestSpriteDefs,
  SPRITE_ID,
  SPRITE_SCALE,
  WINDY_KINDS,
} from './ForestSprites';
import { type ForestWorld, layerZ, TILE_SIZE } from './forestMap';
import { forestTerrainDataUrls, forestWaterMaskDataUrl } from './forestTerrainBitmap';

/**
 * The island itself, painted on the server as one pixelated bitmap plus stamped
 * scenery. The ground is a single image so first paint does not wait on
 * thousands of SVG rects. Trees and animals are `<use>` stamps stacked by tile
 * row so a canopy south of a board paints in front of it.
 *
 * Stamps are siblings of the landmarks (not wrapped in their own stacking
 * context) so `z-index` from `layerZ` actually compares against the boards.
 * Wind, waves and critter motion live on `ForestScene`'s world box, which is
 * the parent of both.
 */

const bitmapSx = (light: string, dark: string, width: number, height: number): SxObject => ({
  backgroundImage: `light-dark(url("${light}"), url("${dark}"))`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: '100% 100%',
  height,
  imageRendering: 'pixelated',
  left: 0,
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width,
  zIndex: 0,
});

const waveSx = (mask: string): SxObject => ({
  backgroundImage:
    'linear-gradient(90deg, transparent 0%, var(--forest-surf) 48%, transparent 100%)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '42% 100%',
  inset: 0,
  maskImage: `url("${mask}")`,
  maskSize: '100% 100%',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 0,
});

const rippleSx = (mask: string): SxObject => ({
  backgroundImage: 'radial-gradient(circle, var(--forest-surf) 0 1px, transparent 1.4px 100%)',
  backgroundPosition: 'center',
  backgroundRepeat: 'repeat',
  backgroundSize: '18% 18%',
  inset: 0,
  maskImage: `url("${mask}")`,
  maskSize: '100% 100%',
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 0,
});

function stampStyle(tileX: number, tileY: number, width: number, height: number, z: number) {
  return {
    height,
    left: tileX * TILE_SIZE - (width - TILE_SIZE) / 2,
    overflow: 'visible',
    pointerEvents: 'none' as const,
    position: 'absolute' as const,
    top: (tileY + 1) * TILE_SIZE - height,
    width,
    zIndex: z,
  };
}

export function ForestTerrain({ world }: { world: ForestWorld }) {
  const width = world.columns * TILE_SIZE;
  const height = world.rows * TILE_SIZE;
  const terrain = forestTerrainDataUrls(world);
  const waterMask = forestWaterMaskDataUrl(world);

  return (
    <>
      <svg
        aria-hidden="true"
        height={0}
        role="presentation"
        style={{ height: 0, overflow: 'hidden', position: 'absolute', width: 0 }}
        viewBox="0 0 1 1"
        width={0}
        xmlns="http://www.w3.org/2000/svg"
      >
        <ForestSpriteDefs />
      </svg>
      <Box aria-hidden="true" sx={bitmapSx(terrain.light, terrain.dark, width, height)} />
      <Box aria-hidden="true" className="forest-wave" sx={waveSx(waterMask)} />
      <Box aria-hidden="true" className="forest-ripple" sx={rippleSx(waterMask)} />
      {world.scenery.map((sprite, index) => {
        const scale = SPRITE_SCALE[sprite.kind];
        const spriteWidth = TILE_SIZE * scale.width;
        const spriteHeight = TILE_SIZE * scale.height;
        const windy = WINDY_KINDS.has(sprite.kind);
        return (
          <svg
            aria-hidden="true"
            className={windy ? 'forest-wind' : undefined}
            height={spriteHeight}
            key={`${sprite.tileY}-${sprite.tileX}-${sprite.kind}`}
            overflow="visible"
            style={{
              ...stampStyle(
                sprite.tileX,
                sprite.tileY,
                spriteWidth,
                spriteHeight,
                layerZ(sprite.tileY),
              ),
              animationDelay: windy ? `${(index % 11) * 345}ms` : undefined,
            }}
            viewBox="0 0 16 16"
            width={spriteWidth}
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href={`#${SPRITE_ID[sprite.kind]}`} />
          </svg>
        );
      })}
      {world.critters.map((critter) => {
        const scale = CRITTER_SCALE[critter.kind];
        const spriteWidth = TILE_SIZE * scale.width;
        const spriteHeight = TILE_SIZE * scale.height;
        return (
          <svg
            aria-hidden="true"
            className={`forest-critter forest-critter-${critter.kind}`}
            height={spriteHeight}
            key={`${critter.kind}-${critter.tileY}-${critter.tileX}`}
            overflow="visible"
            style={{
              ...stampStyle(
                critter.tileX,
                critter.tileY,
                spriteWidth,
                spriteHeight,
                layerZ(critter.tileY),
              ),
              animationDelay: `${critter.delayMs}ms`,
            }}
            viewBox="0 0 16 16"
            width={spriteWidth}
            xmlns="http://www.w3.org/2000/svg"
          >
            <use href={`#${CRITTER_ID[critter.kind]}`} />
          </svg>
        );
      })}
    </>
  );
}
