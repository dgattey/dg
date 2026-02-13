'use client';

import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import { useColorScheme } from '@dg/ui/theme/useColorScheme';
import { Overlay, Map as PigeonMapCore } from 'pigeon-maps';
import { useState } from 'react';
import { Marker } from './Marker';
import { ZoomControls } from './ZoomControls';

/**
 * Stadia Maps tile providers for light and dark modes.
 * Uses their free tier - Alidade Smooth for light, Alidade Smooth Dark for dark.
 * No API key needed for low-volume usage.
 */
const STADIA_LIGHT = (x: number, y: number, z: number, dpr?: number) =>
  `https://tiles.stadiamaps.com/tiles/alidade_smooth/${z}/${x}/${y}${(dpr ?? 1) >= 2 ? '@2x' : ''}.png`;

const STADIA_DARK = (x: number, y: number, z: number, dpr?: number) =>
  `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/${z}/${x}/${y}${(dpr ?? 1) >= 2 ? '@2x' : ''}.png`;

export type PigeonMapProps = {
  /**
   * Location data including coordinates, zoom levels, and marker image
   */
  location: MapLocation;
};

/**
 * Lightweight map component using Pigeon Maps with Stadia tile provider.
 * Supports light/dark mode, zoom controls, and custom markers.
 */
export function PigeonMap({ location }: PigeonMapProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme.mode === 'dark';

  const [center, setCenter] = useState<[number, number]>([
    location.point.latitude,
    location.point.longitude,
  ]);
  const [zoom, setZoom] = useState(location.initialZoom ?? 10);

  const minZoom = location.zoomLevels[0] ?? 1;
  const maxZoom = location.zoomLevels[location.zoomLevels.length - 1] ?? 18;

  const handleZoomIn = () => {
    setZoom((z) => Math.min(z + 1, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(z - 1, minZoom));
  };

  return (
    <PigeonMapCore
      attribution={false}
      center={center}
      dprs={[1, 2]}
      maxZoom={maxZoom}
      metaWheelZoom={true}
      minZoom={minZoom}
      onBoundsChanged={({ center: newCenter, zoom: newZoom }) => {
        setCenter(newCenter);
        setZoom(newZoom);
      }}
      provider={isDark ? STADIA_DARK : STADIA_LIGHT}
      twoFingerDrag={true}
      zoom={zoom}
    >
      <Overlay anchor={[location.point.latitude, location.point.longitude]}>
        <Marker image={location.image} />
      </Overlay>
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
    </PigeonMapCore>
  );
}
