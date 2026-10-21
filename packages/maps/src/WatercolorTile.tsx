import { type CSSProperties, createElement, useRef } from 'react';

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

const tileImgStyle: CSSProperties = {
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

  const containerStyle: CSSProperties = {
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
    <div style={containerStyle}>
      {createElement('img', {
        alt: '',
        onLoad: handleImageLoad,
        src: tile.url,
        style: tileImgStyle,
      })}
      {hasLabels &&
        createElement('img', {
          alt: '',
          onLoad: handleImageLoad,
          src: labelsUrl,
          style: tileImgStyle,
        })}
    </div>
  );
}
