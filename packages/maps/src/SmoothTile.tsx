import type { TileComponentProps } from 'pigeon-maps';
import type { CSSProperties } from 'react';

const tileImageStyle: CSSProperties = {
  display: 'block',
  height: '100%',
  width: '100%',
};

/** A single-layer tile with a fade that keeps theme changes from flashing. */
export function SmoothTile({ tile, tileLoaded }: TileComponentProps) {
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
      <img alt="" onLoad={tileLoaded} src={tile.url} srcSet={tile.srcSet} style={tileImageStyle} />
    </div>
  );
}
