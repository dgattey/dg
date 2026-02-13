import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { Image } from '@dg/ui/dependent/Image';
import { MAP_MARKER_IMAGE_SIZE } from '@dg/ui/helpers/imageSizes';
import type { SxObject, SxProps } from '@dg/ui/theme';
import { Box } from '@mui/material';

const DIMENSION = 100;
const RADIUS = DIMENSION / 2;
const IMAGE_DIMENSION = MAP_MARKER_IMAGE_SIZE;

const markerContainerSx: SxObject = {
  cursor: 'grab',
  height: DIMENSION,
  position: 'relative',
  transform: 'translate(-50%, -50%)',
  width: DIMENSION,
};

const markerFillSx: SxProps = (theme) => ({
  fill: theme.vars.palette.map.markerBackground,
});

const markerStrokeSx: SxProps = (theme) => ({
  stroke: theme.vars.palette.map.markerBorder,
});

const markerImageSx: SxObject = {
  left: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
  position: 'absolute',
  top: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
};

type MarkerProps = {
  /**
   * Optional image to display in the marker
   */
  image?: MapLocation['image'];
};

/**
 * Custom map marker with optional image overlay.
 * Renders as a circular SVG with theme-aware colors.
 * Position is controlled by wrapping Overlay component.
 */
export function Marker({ image }: MarkerProps) {
  // Generate a unique ID for SVG elements
  const id = `marker-${Date.now()}`;

  return (
    <Box sx={markerContainerSx}>
      <svg height={DIMENSION} width={DIMENSION}>
        <title>Map marker</title>
        <defs>
          <Box component="circle" cx={RADIUS} cy={RADIUS} id={id} r={RADIUS} sx={markerFillSx} />
          <clipPath id={`clip-${id}`}>
            <use xlinkHref={`#${id}`} />
          </clipPath>
        </defs>
        <Box
          clipPath={`url(#clip-${id})`}
          component="use"
          strokeWidth="2"
          sx={markerStrokeSx}
          xlinkHref={`#${id}`}
        />
      </svg>
      {image ? (
        <Box component="span" sx={markerImageSx}>
          <Image
            alt="Location marker"
            height={IMAGE_DIMENSION}
            sizes={{
              extraLarge: IMAGE_DIMENSION,
            }}
            url={image.url}
            width={IMAGE_DIMENSION}
          />
        </Box>
      ) : null}
    </Box>
  );
}
