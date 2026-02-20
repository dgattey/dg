'use client';

import type { MapLocation } from '@dg/content-models/contentful/MapLocation';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { Overlay, Map as PigeonMapCore } from 'pigeon-maps';
import { useState } from 'react';
import { Marker } from './Marker';
import { WatercolorTile } from './WatercolorTile';
import { ZoomControls } from './ZoomControls';

const containerSx: SxObject = {
  height: '100%',
  position: 'relative',
  width: '100%',
};

const DEFAULT_MIN_ZOOM = 3;
const DEFAULT_MAX_ZOOM = 18;

export type PigeonMapProps = {
  location: MapLocation;
  stadiaApiKey: string;
};

/**
 * Lightweight map component using Pigeon Maps with Stamen Watercolor tiles
 * and terrain labels overlay. Zoom range is driven by zoomLevels from Contentful.
 */
export function PigeonMap({ location, stadiaApiKey }: PigeonMapProps) {
  const [center, setCenter] = useState<[number, number]>([
    location.point.latitude,
    location.point.longitude,
  ]);
  const levels = location.zoomLevels;
  const initialIndex = levels.indexOf(location.initialZoom ?? levels[0] ?? DEFAULT_MIN_ZOOM);
  const [zoomIndex, setZoomIndex] = useState(initialIndex === -1 ? 0 : initialIndex);
  const zoom = levels[zoomIndex] ?? location.initialZoom ?? 10;

  const minZoom = levels.at(0) ?? DEFAULT_MIN_ZOOM;
  const maxZoom = levels.at(-1) ?? DEFAULT_MAX_ZOOM;

  const provider = (x: number, y: number, z: number) =>
    `https://tiles.stadiamaps.com/tiles/stamen_watercolor/${z}/${x}/${y}.jpg?api_key=${stadiaApiKey}`;

  const handleZoomIn = () => {
    setZoomIndex((i) => Math.min(i + 1, levels.length - 1));
  };

  const handleZoomOut = () => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <Box sx={containerSx}>
      <PigeonMapCore
        attribution={false}
        center={center}
        dprs={[1, 2]}
        maxZoom={maxZoom}
        metaWheelZoom={false}
        metaWheelZoomWarning=""
        minZoom={minZoom}
        onBoundsChanged={({ center: newCenter, zoom: newZoom }) => {
          setCenter(newCenter);
          const closest = levels.reduce(
            (best, level, i) =>
              Math.abs(level - newZoom) < Math.abs((levels[best] ?? 0) - newZoom) ? i : best,
            0,
          );
          setZoomIndex(closest);
        }}
        provider={provider}
        tileComponent={WatercolorTile}
        twoFingerDrag={true}
        zoom={zoom}
      >
        <Overlay anchor={[location.point.latitude, location.point.longitude]}>
          <Marker image={location.image} />
        </Overlay>
      </PigeonMapCore>
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
    </Box>
  );
}
