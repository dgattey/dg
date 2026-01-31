import type { MapLocation } from '@dg/services/contentful/MapLocation';
import { Image } from '@dg/ui/dependent/Image';
import { MAP_MARKER_IMAGE_SIZE } from '@dg/ui/helpers/imageSizes';
import type { SxObject, SxProps } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Marker as MapMarker } from 'react-map-gl/mapbox';

const DIMENSION = 100;
const RADIUS = DIMENSION / 2;
const IMAGE_DIMENSION = MAP_MARKER_IMAGE_SIZE;

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

// Required point, optional image
type MarkerProps = Pick<MapLocation, 'point'> & Partial<Pick<MapLocation, 'image'>>;

/**
 * Creates a standard map marker, centered on a point
 */
export function Marker({ point, image }: MarkerProps) {
  if (!point?.latitude || !point.longitude) {
    return null;
  }
  const id = `${point.latitude},${point.longitude}`;
  return (
    <MapMarker latitude={point.latitude} longitude={point.longitude}>
      <svg height={DIMENSION} width={DIMENSION}>
        <title>
          Map marker for {point.latitude}, {point.longitude}
        </title>
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
            alt={id}
            height={IMAGE_DIMENSION}
            sizes={{
              // Constant size, no need to resize
              extraLarge: IMAGE_DIMENSION,
            }}
            url={image.url}
            width={IMAGE_DIMENSION}
          />
        </Box>
      ) : null}
    </MapMarker>
  );
}
