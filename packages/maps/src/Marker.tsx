import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { GlassContainer } from '@dg/ui/core/GlassContainer';
import { Image } from '@dg/ui/dependent/Image';
import { MAP_MARKER_IMAGE_SIZE } from '@dg/ui/helpers/imageSizes';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';

const DIMENSION = 100;
const IMAGE_DIMENSION = MAP_MARKER_IMAGE_SIZE;

const containerSx: SxObject = {
  border: '2px solid color-mix(in srgb, var(--mui-palette-background-default) 60%, transparent)',
  borderRadius: '50%',
  cursor: 'grab',
  height: DIMENSION,
  opacity: 0.85,
  overflow: 'hidden',
  transform: 'translate(-50%, -50%)',
  width: DIMENSION,
};

const imageSx: SxObject = {
  left: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
  position: 'absolute',
  top: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
};

type MarkerProps = {
  image?: MapLocation['image'];
};

/**
 * Custom map marker with optional image overlay.
 * Uses the shared glass morphism container at higher transparency.
 */
export function Marker({ image }: MarkerProps) {
  return (
    <GlassContainer sx={containerSx}>
      {image ? (
        <Box component="span" sx={imageSx}>
          <Image
            alt="Location marker"
            height={IMAGE_DIMENSION}
            sizes={{ extraLarge: IMAGE_DIMENSION }}
            url={image.url}
            width={IMAGE_DIMENSION}
          />
        </Box>
      ) : null}
    </GlassContainer>
  );
}
