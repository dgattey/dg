'use client';

import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { COLOR_SCHEME_ATTRIBUTE } from '@dg/ui/theme/colorScheme';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { useRef } from 'react';
import type { FramedPath, RouteFrame } from './routeFrame';
import { ROUTE_MAP_TOKENS } from './routeMapTokens';
import { SmoothTile, useHostSize } from './SmoothTile';
import { outdoorsTileUrl, type TileSource } from './tileSource';

const routeSvgSx: SxObject = {
  height: '100%',
  left: 0,
  overflow: 'visible',
  position: 'absolute',
  top: 0,
  width: '100%',
  zIndex: 3,
};

const SCHEMES = ['light', 'dark'] as const;

const schemeLayerSx = (scheme: (typeof SCHEMES)[number]): SxObject => {
  const dark = scheme === 'dark';
  const showDark = { display: dark ? 'block' : 'none' };
  return {
    display: dark ? 'none' : 'block',
    inset: 0,
    position: 'absolute',
    [`html[${COLOR_SCHEME_ATTRIBUTE}="dark"] &`]: showDark,
    '@media (prefers-color-scheme: dark)': {
      [`html:not([${COLOR_SCHEME_ATTRIBUTE}="light"]) &`]: showDark,
    },
  };
};

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

  const containerSx: SxObject = {
    height: '100%',
    isolation: 'isolate',
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'relative',
    width: '100%',
    willChange: 'transform',
  };

  return (
    <Box aria-hidden="true" ref={containerRef} sx={containerSx}>
      {SCHEMES.map((scheme) => {
        const dark = scheme === 'dark';
        const tokens = ROUTE_MAP_TOKENS[scheme];
        const tileLayerSx: SxObject = {
          '& > div': {
            backgroundColor: 'transparent !important',
            height: '100% !important',
            width: '100% !important',
          },
          inset: 0,
          position: 'absolute',
          zIndex: 1,
        };
        const scrimSx: SxObject = {
          background: tokens.scrimGradient,
          inset: 0,
          position: 'absolute',
          zIndex: 2,
        };
        return (
          <Box key={scheme} sx={{ ...schemeLayerSx(scheme), backgroundColor: tokens.background }}>
            <Box sx={tileLayerSx}>
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
            </Box>
            <Box sx={scrimSx} />
          </Box>
        );
      })}
      <Box
        component="svg"
        preserveAspectRatio="xMidYMid slice"
        sx={routeSvgSx}
        viewBox={`0 0 ${frame.width} ${frame.height}`}
      >
        {paths.map(({ d, tone }) => (
          <Box
            component="path"
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
          <Box
            component="path"
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
      </Box>
    </Box>
  );
}
