import { decodeRoutes, frameAround, framePaths, type GeoBounds, type MapRoute } from './routeFrame';

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
  const frame = frameAround(bounds, FRAME);
  return (
    <svg
      aria-hidden="true"
      className="routeAtlas__sketch"
      preserveAspectRatio="xMidYMid slice"
      viewBox={`0 0 ${frame.width} ${frame.height}`}
    >
      {framePaths(frame, decodeRoutes(routes)).map(({ d, tone }) => (
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
