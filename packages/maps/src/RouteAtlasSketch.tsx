import { useRef } from 'react';
import {
  decodeRoutes,
  type FramedPath,
  frameAround,
  framePaths,
  type GeoBounds,
  type MapRoute,
} from './routeFrame';

const FRAME = { height: 600, padding: 24, width: 800 };

/**
 * The atlas without tiles or WebGL, for tests and `MAP_TILES=offline`: the
 * routes around `bounds`, inked over the offline paper.
 */
export function RouteAtlasSketch({
  bounds,
  routes,
}: {
  bounds: GeoBounds;
  routes: ReadonlyArray<MapRoute>;
}) {
  const boundsKey = `${bounds[0][0]},${bounds[0][1]}:${bounds[1][0]},${bounds[1][1]}`;
  const frame = frameAround(bounds, FRAME);
  const cacheRef = useRef<{
    boundsKey: string;
    paths: Array<FramedPath>;
    routes: ReadonlyArray<MapRoute>;
  } | null>(null);
  if (
    !cacheRef.current ||
    cacheRef.current.boundsKey !== boundsKey ||
    cacheRef.current.routes !== routes
  ) {
    cacheRef.current = {
      boundsKey,
      paths: framePaths(frame, decodeRoutes(routes)),
      routes,
    };
  }
  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${frame.width} ${frame.height}`}
    >
      {cacheRef.current.paths.map(({ d, tone }) => (
        <path
          d={d}
          data-tone={tone}
          fill="none"
          key={tone}
          stroke={`var(--${tone})`}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}
