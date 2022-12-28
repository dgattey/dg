import type { MapLocation } from 'api/types/MapLocation';
import { Image } from 'components/Image';
import { Marker as MapMarker } from 'react-map-gl';
import { MAP_MARKER_IMAGE_SIZE } from 'constants/imageSizes';
import { Box } from '@mui/material';

const DIMENSION = 100;
const RADIUS = DIMENSION / 2;
const IMAGE_DIMENSION = MAP_MARKER_IMAGE_SIZE;

// Required point, optional image
type MarkerProps = Pick<MapLocation, 'point'> & Partial<Pick<MapLocation, 'image'>>;

/**
 * Creates a standard map marker, centered on a point
 */
export function Marker({ point, image }: MarkerProps) {
  if (!point?.latitude || !point?.longitude) {
    return null;
  }
  const id = `${point.latitude},${point.longitude}`;
  return (
    <MapMarker {...point}>
      <svg width={DIMENSION} height={DIMENSION}>
        <defs>
          <Box
            component="circle"
            id={id}
            r={RADIUS}
            cx={RADIUS}
            cy={RADIUS}
            sx={(theme) => ({ fill: theme.vars.palette.map.markerBackground })}
          />
          <clipPath id="clip">
            <use xlinkHref={`#${id}`} />
          </clipPath>
        </defs>
        <Box
          component="use"
          xlinkHref={`#${id}`}
          strokeWidth="2"
          clipPath="url(#clip)"
          sx={{
            stroke: (theme) => theme.vars.palette.map.markerBorder,
          }}
        />
      </svg>
      {image && (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            left: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
            top: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
          }}
        >
          <Image
            width={IMAGE_DIMENSION}
            height={IMAGE_DIMENSION}
            url={image.url}
            alt={id}
            sizes={{
              // Constant size, no need to resize
              extraLarge: IMAGE_DIMENSION,
            }}
          />
        </Box>
      )}
    </MapMarker>
  );
}
