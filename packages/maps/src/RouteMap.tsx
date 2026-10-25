'use client';

import { Map as PigeonMapCore } from 'pigeon-maps';
import { useRef } from 'react';
import { RouteSvgPaths } from './RouteSvgPaths';
import type { FramedPath, RouteFrame } from './routeFrame';
import { ROUTE_MAP_TOKENS } from './routeMapTokens';
import { SmoothTile, useHostSize } from './SmoothTile';
import { outdoorsTileUrl, type TileSource } from './tileSource';

const SCHEMES = ['light', 'dark'] as const;

type RouteMapProps = {
  frame: RouteFrame;
  paths: ReadonlyArray<FramedPath>;
  strokeWidth: number;
  tileSource: TileSource;
};

/**
 * A non-interactive, theme-aware map for card backgrounds, inking paths the
 * server already projected into `frame`. The frame scales to cover the card,
 * and the tiles zoom by the same factor so the ink stays registered to them.
 * Hosts that render text over the map must back their own text regions.
 */
export function RouteMap({ frame, paths, strokeWidth, tileSource }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useHostSize(containerRef, { height: frame.height, width: frame.width });
  const zoom =
    frame.zoom + Math.log2(Math.max(size.width / frame.width, size.height / frame.height));

  return (
    <div aria-hidden="true" data-route-map="" ref={containerRef}>
      {SCHEMES.map((scheme) => {
        const dark = scheme === 'dark';
        return (
          <div data-map-scheme={scheme} key={scheme}>
            <div data-map-tile-layer="">
              <PigeonMapCore
                animate={false}
                attribution={false}
                center={frame.center}
                defaultHeight={size.height}
                defaultWidth={size.width}
                dprs={[1, 2]}
                key={`${Math.round(size.width)}x${Math.round(size.height)}`}
                mouseEvents={false}
                provider={(x, y, tileZoom, dpr) =>
                  outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tileZoom })
                }
                tileComponent={SmoothTile}
                touchEvents={false}
                zoom={zoom}
                zoomSnap={false}
              />
            </div>
            <div data-route-map-scrim="" />
          </div>
        );
      })}
      <svg
        aria-hidden="true"
        data-route-map-svg=""
        preserveAspectRatio="xMidYMid slice"
        viewBox={`0 0 ${frame.width} ${frame.height}`}
      >
        <RouteSvgPaths
          casingStroke={`light-dark(${ROUTE_MAP_TOKENS.light.casingStroke}, ${ROUTE_MAP_TOKENS.dark.casingStroke})`}
          casingWidth={strokeWidth + 2.5}
          lineWidth={strokeWidth}
          paths={paths}
        />
      </svg>
    </div>
  );
}
