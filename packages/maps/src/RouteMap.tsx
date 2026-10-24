'use client';

import { COLOR_SCHEME_ATTRIBUTE } from '@dg/ui/theme/colorScheme';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { type CSSProperties, useRef } from 'react';
import type { FramedPath, RouteFrame } from './routeFrame';
import { ROUTE_MAP_TOKENS } from './routeMapTokens';
import { SmoothTile, useHostSize } from './SmoothTile';
import { outdoorsTileUrl, type TileSource } from './tileSource';

const routeSvgStyle: CSSProperties = {
  height: '100%',
  left: 0,
  overflow: 'visible',
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: 3,
};

const containerStyle: CSSProperties = {
  height: '100%',
  isolation: 'isolate',
  overflow: 'hidden',
  pointerEvents: 'none',
  position: 'relative',
  width: '100%',
  willChange: 'transform',
};

const tileLayerStyle: CSSProperties = {
  inset: 0,
  position: 'absolute',
  zIndex: 1,
};

const SCHEMES = ['light', 'dark'] as const;

const ROUTE_MAP_CSS = `
[data-map-scheme] {
  inset: 0;
  position: absolute;
}
[data-map-scheme="light"] {
  display: block;
}
[data-map-scheme="dark"] {
  display: none;
}
html[${COLOR_SCHEME_ATTRIBUTE}="dark"] [data-map-scheme="light"] {
  display: none;
}
html[${COLOR_SCHEME_ATTRIBUTE}="dark"] [data-map-scheme="dark"] {
  display: block;
}
@media (prefers-color-scheme: dark) {
  html:not([${COLOR_SCHEME_ATTRIBUTE}="light"]) [data-map-scheme="light"] {
    display: none;
  }
  html:not([${COLOR_SCHEME_ATTRIBUTE}="light"]) [data-map-scheme="dark"] {
    display: block;
  }
}
[data-map-tile-layer] > div {
  background-color: transparent !important;
  height: 100% !important;
  width: 100% !important;
}
`;

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
    <div aria-hidden="true" ref={containerRef} style={containerStyle}>
      <style href="dg-route-map" precedence="default">
        {ROUTE_MAP_CSS}
      </style>
      {SCHEMES.map((scheme) => {
        const dark = scheme === 'dark';
        const tokens = ROUTE_MAP_TOKENS[scheme];
        return (
          <div data-map-scheme={scheme} key={scheme} style={{ backgroundColor: tokens.background }}>
            <div data-map-tile-layer="" style={tileLayerStyle}>
              <PigeonMapCore
                animate={false}
                attribution={false}
                center={frame.center}
                dprs={[1, 2]}
                height={size.height}
                key={`${Math.round(size.width)}x${Math.round(size.height)}`}
                mouseEvents={false}
                provider={(x, y, tileZoom, dpr) =>
                  outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tileZoom })
                }
                tileComponent={SmoothTile}
                touchEvents={false}
                width={size.width}
                zoom={zoom}
                zoomSnap={false}
              />
            </div>
            <div
              style={{
                background: tokens.scrimGradient,
                inset: 0,
                position: 'absolute',
                zIndex: 2,
              }}
            />
          </div>
        );
      })}
      <svg
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
        style={routeSvgStyle}
        viewBox={`0 0 ${frame.width} ${frame.height}`}
      >
        {paths.map(({ d, tone }) => (
          <path
            d={d}
            fill="none"
            key={`casing-${tone}`}
            stroke={`light-dark(${ROUTE_MAP_TOKENS.light.casingStroke}, ${ROUTE_MAP_TOKENS.dark.casingStroke})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth + 2.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {paths.map(({ d, tone }) => (
          <path
            d={d}
            data-tone={tone}
            fill="none"
            key={tone}
            stroke={`var(--${tone})`}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  );
}
