'use client';

import { useTheme } from '@mui/material';
import { Minus, Plus } from 'lucide-react';
import type { RefObject } from 'react';
import type { MapRef } from 'react-map-gl/mapbox';
import { Control } from './Control';

type StandardControlsProps = {
  /**
   * The zoom function
   */
  mapRef: RefObject<MapRef | null>;
};

/**
 * Creates controls that zoom in/out the map and collapse the map when it's expanded
 */
export function StandardControls({ mapRef }: StandardControlsProps) {
  const theme = useTheme();
  const zoom = (inward: boolean) => (event: React.MouseEvent<SVGElement>) => {
    if (mapRef.current) {
      (inward ? mapRef.current.zoomIn : mapRef.current.zoomOut)();
    }
    event.stopPropagation();
    event.preventDefault();
  };
  return (
    <Control position="top-left" theme={theme}>
      <Plus onClick={zoom(true)} size="1em" />
      <Minus onClick={zoom(false)} size="1em" />
    </Control>
  );
}
