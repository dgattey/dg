import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { useRef } from 'react';

type Tile = {
  url: string;
  srcSet: string;
  left: number;
  top: number;
  width: number;
  height: number;
  active: boolean;
};

type TileComponentProps = {
  tile: Tile;
  tileLoaded: () => void;
};

const tileImgSx: SxObject = {
  display: 'block',
  height: '100%',
  left: 0,
  position: 'absolute',
  top: 0,
  width: '100%',
};

/**
 * Derives the terrain labels URL from the watercolor URL by swapping the
 * tile layer path and format. Labels use PNG for transparency and @2x
 * for crisp text rendering.
 */
function toLabelsUrl(watercolorUrl: string) {
  return watercolorUrl
    .replace('stamen_watercolor', 'stamen_terrain_labels')
    .replace('.jpg', '@2x.png');
}

/**
 * Custom pigeon-maps tile that stacks Stamen Watercolor (base) with
 * Stamen Terrain Labels (overlay). Both images must load before
 * signaling tile completion to pigeon-maps.
 */
export function WatercolorTile({ tile, tileLoaded }: TileComponentProps) {
  const loadedCount = useRef(0);

  const handleImageLoad = () => {
    loadedCount.current += 1;
    if (loadedCount.current >= 2) {
      tileLoaded();
    }
  };

  const labelsUrl = toLabelsUrl(tile.url);

  const containerSx: SxObject = {
    height: tile.height,
    left: tile.left,
    opacity: tile.active ? 1 : 0,
    overflow: 'hidden',
    position: 'absolute',
    top: tile.top,
    transition: 'opacity 0.2s',
    width: tile.width,
  };

  return (
    <Box sx={containerSx}>
      {/* biome-ignore lint/performance/noImgElement: dynamic tile URLs from pigeon-maps, not optimizable by next/image */}
      <Box alt="" component="img" onLoad={handleImageLoad} src={tile.url} sx={tileImgSx} />
      {/* biome-ignore lint/performance/noImgElement: dynamic tile URLs from pigeon-maps, not optimizable by next/image */}
      <Box alt="" component="img" onLoad={handleImageLoad} src={labelsUrl} sx={tileImgSx} />
    </Box>
  );
}
