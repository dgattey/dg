import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { TileComponentProps } from 'pigeon-maps';

const tileImageSx: SxObject = {
  display: 'block',
  height: '100%',
  width: '100%',
};

/** A single-layer tile with a fade that keeps theme changes from flashing. */
export function SmoothTile({ tile, tileLoaded }: TileComponentProps) {
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
      <Box
        alt=""
        component="img"
        onLoad={tileLoaded}
        src={tile.url}
        srcSet={tile.srcSet}
        sx={tileImageSx}
      />
    </Box>
  );
}
