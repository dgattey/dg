import type { MapLocation } from 'api/types/MapLocation';
import { Image } from 'components/Image';
import { Marker as MapMarker } from 'react-map-gl';
import styled from '@emotion/styled';
import { MAP_MARKER_IMAGE_SIZE } from 'constants/imageSizes';

const DIMENSION = 100;
const RADIUS = DIMENSION / 2;
const IMAGE_DIMENSION = MAP_MARKER_IMAGE_SIZE;

// Required point, optional image
type MarkerProps = Pick<MapLocation, 'point'> & Partial<Pick<MapLocation, 'image'>>;

/**
 * Creates a circle to show
 */
const AreaIndicator = styled.circle`
  fill: var(--map-marker);
`;

const ImageContainer = styled.span`
  position: absolute;
  left: ${(DIMENSION - IMAGE_DIMENSION) / 2}px;
  top: ${(DIMENSION - IMAGE_DIMENSION) / 2}px;
`;

/**
 * Creates a standard map marker, centered on a point
 */
export function Marker({ point, image }: MarkerProps) {
  const id = `${point?.latitude},${point?.longitude}`;
  return (
    <MapMarker {...point}>
      <svg width={DIMENSION} height={DIMENSION}>
        <defs>
          <AreaIndicator id={id} r={RADIUS} cx={RADIUS} cy={RADIUS} />
          <clipPath id="clip">
            <use xlinkHref={`#${id}`} />
          </clipPath>
        </defs>
        <use
          xlinkHref={`#${id}`}
          stroke="var(--map-marker-border)"
          strokeWidth="2"
          clipPath="url(#clip)"
        />
      </svg>
      {image && (
        <ImageContainer>
          <Image
            width={IMAGE_DIMENSION}
            height={IMAGE_DIMENSION}
            url={image.url}
            alt={`${point?.latitude} ${point?.longitude}`}
            sizes={{
              // Constant size, no need to resize
              extraLarge: IMAGE_DIMENSION,
            }}
          />
        </ImageContainer>
      )}
    </MapMarker>
  );
}
