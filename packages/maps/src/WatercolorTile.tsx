import { type CSSProperties, useRef } from 'react';

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
 * Stamen Terrain Labels (overlay). Every rendered image must load before
 * signaling tile completion to pigeon-maps. Offline placeholder tiles
 * have no labels layer.
 */
export function WatercolorTile({ tile, tileLoaded }: TileComponentProps) {
  const loadedCount = useRef(0);
  const labelsUrl = toLabelsUrl(tile.url);
  const hasLabels = labelsUrl !== tile.url;

  const handleImageLoad = () => {
    loadedCount.current += 1;
    if (loadedCount.current >= (hasLabels ? 2 : 1)) {
      tileLoaded();
    }
  };

  const tileVars = {
    '--tile-h': `${tile.height}px`,
    '--tile-left': `${tile.left}px`,
    '--tile-top': `${tile.top}px`,
    '--tile-w': `${tile.width}px`,
  } as CSSProperties;

  return (
    <div data-active={tile.active ? 'true' : undefined} data-map-tile="" style={tileVars}>
      <img
        alt=""
        data-watercolor-tile-img=""
        decoding="async"
        onLoad={handleImageLoad}
        src={tile.url}
      />
      {hasLabels && (
        <img
          alt=""
          data-watercolor-tile-img=""
          decoding="async"
          onLoad={handleImageLoad}
          src={labelsUrl}
        />
      )}
    </div>
  );
}
