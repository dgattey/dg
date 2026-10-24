'use client';

import { Box } from '@dg/ui/core/Box';
import type { SxObject } from '@dg/ui/theme';
import { COLOR_SCHEME_ATTRIBUTE } from '@dg/ui/theme/colorScheme';
import type { TileComponentProps } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import type { FramedPath, RouteFrame } from './routeFrame';
import { ROUTE_MAP_TOKENS } from './routeMapTokens';
import { stadiaTileUrl, type TileSource } from './tileSource';

const tileImageStyle: CSSProperties = {
  display: 'block',
  height: '100%',
  width: '100%',
};

/** Lazy, so the hidden scheme's tiles never load until that scheme shows. */
function SmoothTile({ tile, tileLoaded }: TileComponentProps) {
  return (
    <div
      style={{
        height: tile.height,
        left: tile.left,
        opacity: tile.active ? 1 : 0,
        overflow: 'hidden',
        position: 'absolute',
        top: tile.top,
        transition: 'opacity 0.2s',
        width: tile.width,
      }}
    >
      <img
        alt=""
        loading="lazy"
        onLoad={tileLoaded}
        src={tile.url}
        srcSet={tile.srcSet}
        style={tileImageStyle}
      />
    </div>
  );
}

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

function tileUrl({
  dark,
  dpr,
  tileSource,
  x,
  y,
  zoom,
}: {
  dark: boolean;
  dpr?: number;
  tileSource: TileSource;
  x: number;
  y: number;
  zoom: number;
}) {
  return stadiaTileUrl(tileSource, {
    dark,
    extension: 'png',
    retina: Boolean(dpr && dpr > 1),
    // Outdoors carries trails, contours and greenery, so it still reads as a map
    // under a scrim. Alidade Smooth Dark is the closest dark counterpart.
    style: dark ? 'alidade_smooth_dark' : 'outdoors',
    x,
    y,
    zoom,
  });
}

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
  const [size, setSize] = useState({ height: frame.height, width: frame.width });
  const zoom =
    frame.zoom + Math.log2(Math.max(size.width / frame.width, size.height / frame.height));

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    // borderBoxSize ignores ancestor transforms (rotated collage cards) but keeps
    // fractional pixels, unlike getBoundingClientRect or offsetWidth.
    const observer = new ResizeObserver(([entry]) => {
      const box = entry?.borderBoxSize[0];
      if (box && box.blockSize > 0 && box.inlineSize > 0) {
        setSize({ height: box.blockSize, width: box.inlineSize });
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
                  tileUrl({ dark, dpr, tileSource, x, y, zoom: tileZoom })
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
