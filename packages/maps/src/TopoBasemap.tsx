'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { Point } from 'pigeon-maps';
import { projectRouteToPixels, toSvgPath } from './routeGeometry';
import { buildTopoLayers } from './topoBasemap';

const topoBasemapSx: SxObject = {
  height: '100%',
  inset: 0,
  position: 'absolute',
  width: '100%',
  zIndex: 0,
};

function projectedPath(
  line: Array<Point>,
  viewport: {
    center: Point;
    height: number;
    width: number;
    zoom: number;
  },
) {
  return toSvgPath(projectRouteToPixels({ ...viewport, points: line }));
}

/** Cream/sage outdoors fallback derived from the live route bbox. */
export function TopoBasemap({
  center,
  height,
  points,
  width,
  zoom,
}: {
  center: Point;
  height: number;
  points: Array<Point>;
  width: number;
  zoom: number;
}) {
  const layers = buildTopoLayers(points);
  const viewport = { center, height, width, zoom };

  return (
    <Box
      aria-hidden="true"
      component="svg"
      preserveAspectRatio="xMidYMid slice"
      sx={topoBasemapSx}
      viewBox={`0 0 ${width} ${height}`}
    >
      <rect fill={layers.land} height={height} width={width} />
      {layers.bands.map((band) => (
        <path
          d={`${projectedPath(band.ring, viewport)} Z`}
          fill={band.fill}
          key={band.id}
          opacity={band.opacity}
        />
      ))}
      {layers.water.map((body) => (
        <path
          d={`${projectedPath(body.ring, viewport)} Z`}
          fill={body.fill}
          key={body.id}
          opacity={body.opacity}
        />
      ))}
      {layers.contours.map((contour) => (
        <path
          d={projectedPath(contour.line, viewport)}
          fill="none"
          key={contour.id}
          opacity={contour.opacity}
          stroke={contour.stroke}
          strokeWidth={contour.strokeWidth}
        />
      ))}
      {layers.roads.map((road) => (
        <path
          d={projectedPath(road.line, viewport)}
          fill="none"
          key={road.id}
          opacity={road.opacity}
          stroke={road.stroke}
          strokeLinecap="round"
          strokeWidth={road.strokeWidth}
        />
      ))}
    </Box>
  );
}
