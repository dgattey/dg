import { Marker as MapMarker } from 'react-map-gl';
import styled from 'styled-components';
import type { MapLocation } from './Map';

const DIMENSION = 100;
const RADIUS = DIMENSION / 2;

// Required point, optional image
type Props = Pick<MapLocation, 'point'> & Partial<Pick<MapLocation, 'image'>>;

/**
 * Creates a circle to show
 */
const AreaIndicator = styled.circle.attrs({ r: RADIUS, cx: RADIUS, cy: RADIUS })`
  fill: var(--map-marker);
  stroke: var(--map-marker-border);
  stroke-width: 1px;
`;

/**
 * Creates a standard map marker, centered on a point
 */
const Marker = ({ point, image }: Props) => (
  <MapMarker {...point}>
    <svg width={DIMENSION} height={DIMENSION}>
      <AreaIndicator />
      {image && <image width={DIMENSION} height={DIMENSION} href={image.url} />}
    </svg>
  </MapMarker>
);

export default Marker;
