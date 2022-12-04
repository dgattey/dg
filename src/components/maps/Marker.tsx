import type { MapLocation } from 'api/types/MapLocation';
import Image from 'components/Image';
import { Marker as MapMarker } from 'react-map-gl';
import styled from 'styled-components';

const DIMENSION = 100;
const RADIUS = DIMENSION / 2;
const IMAGE_DIMENSION = DIMENSION * 0.85;

// Required point, optional image
type Props = Pick<MapLocation, 'point'> & Partial<Pick<MapLocation, 'image'>>;

/**
 * Creates a circle to show
 */
const AreaIndicator = styled.circle.attrs({ r: RADIUS, cx: RADIUS, cy: RADIUS })`
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
const Marker = ({ point, image }: Props) => {
  const id = `${point?.latitude},${point?.longitude}`;
  return (
    <MapMarker {...point}>
      <svg width={DIMENSION} height={DIMENSION}>
        <defs>
          <AreaIndicator id={id} />
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
          />
        </ImageContainer>
      )}
    </MapMarker>
  );
};

export default Marker;
