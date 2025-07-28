import { Box } from '@mui/material';
import type { MapLocation } from 'api/contentful/MapLocation';
import { Marker as MapMarker } from 'react-map-gl/mapbox';
import { Image } from 'ui/dependent/Image';
import { MAP_MARKER_IMAGE_SIZE } from 'ui/helpers/imageSizes';

const DIMENSION = 100;
const RADIUS = DIMENSION / 2;
const IMAGE_DIMENSION = MAP_MARKER_IMAGE_SIZE;

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
        <defs>
          <Box
            component="circle"
            cx={RADIUS}
            cy={RADIUS}
            id={id}
            r={RADIUS}
            sx={(theme) => ({ fill: theme.vars.palette.map.markerBackground })}
          />
          <clipPath id="clip">
            <use xlinkHref={`#${id}`} />
          </clipPath>
        </defs>
        <Box
          clipPath="url(#clip)"
          component="use"
          strokeWidth="2"
          sx={{
            stroke: (theme) => theme.vars.palette.map.markerBorder,
          }}
          xlinkHref={`#${id}`}
        />
      </svg>
      {image ? (
        <Box
          component="span"
          sx={{
            position: 'absolute',
            left: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
            top: `${(DIMENSION - IMAGE_DIMENSION) / 2}px`,
          }}
        >
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
