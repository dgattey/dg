import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import {
  CRITTER_ID,
  CRITTER_SCALE,
  CRITTER_VIEWBOX,
  ForestSpriteDefs,
  SPRITE_ID,
  SPRITE_SCALE,
  SPRITE_VIEWBOX,
  WINDY_KINDS,
} from './ForestSprites';
import { forestGroundPath } from './forestGround';
import { type ForestWorld, layerZ, TILE_SIZE } from './forestMap';
import { forestShoreClipPath } from './forestShore';

/**
 * The island itself, painted on the server as one blended bitmap plus stamped
 * scenery. The ground is a single image so first paint does not wait on
 * thousands of SVG rects. Trees and animals are `<use>` stamps stacked by tile
 * row so a canopy south of a board paints in front of it. Each stamp is a
 * distinct silhouette, scaled so groves mix sizes instead of cloning one pine.
 *
 * Stamps are siblings of the landmarks (not wrapped in their own stacking
 * context) so `z-index` from `layerZ` actually compares against the boards.
 * Wind, waves and critter motion live on `ForestScene`'s world box, which is
 * the parent of both.
 */

const landImgSx = (width: number, height: number, scheme: 'dark' | 'light'): SxObject => ({
  '@media (prefers-color-scheme: dark)': {
    display: scheme === 'dark' ? 'block' : 'none',
  },
  display: scheme === 'dark' ? 'none' : 'block',
  height,
  imageRendering: 'auto',
  left: 0,
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width,
  zIndex: 1,
});

const landSvgSx = (width: number, height: number): SxObject => ({
  height,
  left: 0,
  overflow: 'visible',
  pointerEvents: 'none',
  position: 'absolute',
  top: 0,
  width,
  zIndex: 1,
});

const waveSx: SxObject = {
  backgroundImage:
    'linear-gradient(90deg, transparent 0%, var(--forest-surf) 48%, transparent 100%)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '42% 100%',
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 0,
};

const rippleSx: SxObject = {
  backgroundImage: 'radial-gradient(circle, var(--forest-surf) 0 1px, transparent 1.4px 100%)',
  backgroundPosition: 'center',
  backgroundRepeat: 'repeat',
  backgroundSize: '18% 18%',
  inset: 0,
  pointerEvents: 'none',
  position: 'absolute',
  zIndex: 0,
};

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
  const light = forestGroundPath(world.seed, 'light.png');
  const dark = forestGroundPath(world.seed, 'dark.png');
  const shore = forestShoreClipPath(world);
  const shoreId = `forest-shore-${world.seed}`;

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
      <Box aria-hidden="true" className="forest-wave" sx={waveSx} />
      <Box aria-hidden="true" className="forest-ripple" sx={rippleSx} />
      <Box
        alt=""
        aria-hidden="true"
        className="forest-land"
        component="img"
        decoding="async"
        fetchPriority="low"
        height={height}
        src={light}
        sx={landImgSx(width, height, 'light')}
        width={width}
      />
      <Box
        alt=""
        aria-hidden="true"
        className="forest-land"
        component="img"
        decoding="async"
        fetchPriority="low"
        height={height}
        src={dark}
        sx={landImgSx(width, height, 'dark')}
        width={width}
      />
      <Box
        aria-hidden="true"
        component="svg"
        sx={landSvgSx(width, height)}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <path d={shore} fillRule="evenodd" id={`${shoreId}-stroke`} />
        </defs>
        <use
          fill="none"
          href={`#${shoreId}-stroke`}
          stroke="var(--forest-sand)"
          strokeLinejoin="round"
          strokeWidth={28}
        />
      </Box>
      {world.scenery.map((sprite, index) => {
        const scale = SPRITE_SCALE[sprite.kind];
        const spriteWidth = TILE_SIZE * scale.width * sprite.scale;
        const spriteHeight = TILE_SIZE * scale.height * sprite.scale;
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
            viewBox={SPRITE_VIEWBOX[sprite.kind]}
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
            viewBox={CRITTER_VIEWBOX[critter.kind]}
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
