import { Minus, Plus } from 'lucide-react';
import type { RefObject } from 'react';
import type { MapRef } from 'react-map-gl';
import Control from './Control';

interface Props {
  /**
   * The zoom function
   */
  mapRef: RefObject<MapRef>;
}

/**
 * Creates controls that zoom in/out the map and collapse the map when it's expanded
 */
const StandardControls = ({ mapRef }: Props) => {
  const zoom = (inward: boolean) => (event: React.MouseEvent<SVGElement, MouseEvent>) => {
    (inward ? mapRef.current?.zoomIn : mapRef.current?.zoomOut)?.();
    event.stopPropagation();
    event.preventDefault();
  };
  return (
    <Control position="top-left">
      <Plus size="1em" onClick={zoom(true)} />
      <Minus size="1em" onClick={zoom(false)} />
    </Control>
  );
};

export default StandardControls;
