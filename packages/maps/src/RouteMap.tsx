import type { FramedPath, RouteFrame } from './routeFrame';
import { ROUTE_MAP_TOKENS } from './routeMapTokens';
import { frameTiles } from './SmoothTile';
import type { TileSource } from './tileSource';

const SCHEMES = ['light', 'dark'] as const;

type RouteMapProps = {
  frame: RouteFrame;
  paths: ReadonlyArray<FramedPath>;
  strokeWidth: number;
  tileSource: TileSource;
};

/**
 * A non-interactive, theme-aware map for card backgrounds, inking paths the
 * server already projected into `frame`. Tiles and SVG routes share the same
 * card-relative coordinate space so every breakpoint renders without reflow.
 */
export function RouteMap({ frame, paths, strokeWidth, tileSource }: RouteMapProps) {
  const casingStroke = `light-dark(${ROUTE_MAP_TOKENS.light.casingStroke}, ${ROUTE_MAP_TOKENS.dark.casingStroke})`;
  const customPaths = paths.some((p) => p.stroke !== undefined);

  return (
    <div aria-hidden="true" data-route-map="">
      {SCHEMES.map((scheme) => (
        <div data-map-scheme={scheme} key={scheme}>
          <div data-map-tile-layer="">
            {frameTiles({ ...frame, dark: scheme === 'dark', tileSource })}
          </div>
          <div data-route-map-scrim="" />
        </div>
      ))}
      <svg
        aria-hidden="true"
        data-route-map-svg=""
        preserveAspectRatio="none"
        viewBox={`0 0 ${frame.width} ${frame.height}`}
      >
        {customPaths
          ? paths.map(({ d, opacity, stroke, tone, width }) => (
              <path
                d={d}
                data-tone={tone}
                fill="none"
                key={tone}
                stroke={stroke}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity={opacity}
                strokeWidth={width ?? strokeWidth}
                vectorEffect="non-scaling-stroke"
              />
            ))
          : [true, false].map((casing) =>
              paths.map(({ d, tone }) => (
                <path
                  d={d}
                  data-tone={casing ? undefined : tone}
                  fill="none"
                  key={casing ? `casing-${tone}` : tone}
                  stroke={casing ? casingStroke : `var(--${tone})`}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={casing ? strokeWidth + 2.5 : strokeWidth}
                  vectorEffect="non-scaling-stroke"
                />
              )),
            )}
      </svg>
    </div>
  );
}
