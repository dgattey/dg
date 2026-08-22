'use client';

import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import type { Point } from 'pigeon-maps';
import { projectRouteToPixels, toSvgPath } from './routeGeometry';
import type { TopoDot } from './topoBasemap';
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

function projectedDot(
  dot: TopoDot,
  viewport: {
    center: Point;
    height: number;
    width: number;
    zoom: number;
  },
) {
  const [center] = projectRouteToPixels({ ...viewport, points: [dot.point] });
  const [edge] = projectRouteToPixels({
    ...viewport,
    points: [[dot.point[0] + dot.radiusLat, dot.point[1] + dot.radiusLng]],
  });
  if (!center || !edge) {
    return { cx: 0, cy: 0, rx: 0, ry: 0 };
  }
  return {
    cx: center.x,
    cy: center.y,
    rx: Math.max(Math.abs(edge.x - center.x), 0.6),
    ry: Math.max(Math.abs(edge.y - center.y), 0.6),
  };
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
  const grainId = `topo-paper-${layers.grainSeed}`;

  return (
    <Box
      aria-hidden="true"
      component="svg"
      preserveAspectRatio="xMidYMid slice"
      sx={topoBasemapSx}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <filter height="100%" id={grainId} width="100%" x="0" y="0">
          <feTurbulence
            baseFrequency="0.78"
            numOctaves="3"
            seed={layers.grainSeed % 10_000}
            type="fractalNoise"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.42  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.028 0"
          />
        </filter>
      </defs>
      <rect fill={layers.land} height={height} width={width} />
      <rect filter={`url(#${grainId})`} height={height} width={width} />
      {layers.bands.map((band) => (
        <path
          d={`${projectedPath(band.ring, viewport)} Z`}
          fill={band.fill}
          key={band.id}
          opacity={band.opacity}
        />
      ))}
      {layers.canopy.map((dot) => {
        const ellipse = projectedDot(dot, viewport);
        return (
          <ellipse
            cx={ellipse.cx}
            cy={ellipse.cy}
            fill={dot.fill}
            key={dot.id}
            opacity={dot.opacity}
            rx={ellipse.rx}
            ry={ellipse.ry}
          />
        );
      })}
      {layers.water.map((body) => (
        <path
          d={`${projectedPath(body.ring, viewport)} Z`}
          fill={body.fill}
          key={body.id}
          opacity={body.opacity}
        />
      ))}
      {layers.shore.map((line) => (
        <path
          d={projectedPath(line.line, viewport)}
          fill="none"
          key={line.id}
          stroke={line.stroke}
          strokeLinecap="round"
          strokeWidth={line.strokeWidth}
        />
      ))}
      {layers.contours.map((contour) => (
        <path
          d={projectedPath(contour.line, viewport)}
          fill="none"
          key={contour.id}
          stroke={contour.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={contour.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {layers.roads.map((road) => (
        <path
          d={projectedPath(road.line, viewport)}
          fill="none"
          key={road.id}
          stroke={road.stroke}
          strokeLinecap="round"
          strokeWidth={road.strokeWidth}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </Box>
  );
}
