'use client';

import type { Point } from 'pigeon-maps';
import { Map as PigeonMapCore } from 'pigeon-maps';
import { use, useEffect, useRef, useState } from 'react';
import { VisibleRoutes } from '../VisibleRoutes';
import {
  AtlasRoutesCanvas,
  applyRelativeTransform,
  buildWorkerRoutes,
  computeTransformBasis,
  type TransformBasis,
  unprojectMercatorRef,
  type WorkerRouteEntry,
} from './AtlasRoutesCanvas';
import { RouteSvgPaths } from './RouteSvgPaths';
import {
  type DecodedRoute,
  decodeRoutes,
  type FramedPath,
  frameAround,
  type GeoBounds,
  type MapRoute,
  MERCATOR_REF_ZOOM,
  mercatorPaths,
  mercatorRefPoint,
} from './routeFrame';
import { SmoothTile, useHostSize } from './SmoothTile';
import { outdoorsTileUrl, type TileSource } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const FIT_PADDING = 36;
const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const DEFAULT_SIZE = { height: 600, width: 800 };
const WHEEL_PIXELS_PER_ZOOM = 150;
const WHEEL_SETTLE_MS = 140;
const BUTTON_ANIM_MS = 150;

export function AtlasRoutesOverlay({
  center,
  dark,
  height,
  left,
  mapState,
  paths,
  top,
  width,
  zoom,
}: {
  center: Point;
  dark: boolean;
  height: number;
  left?: number;
  mapState?: { center: Point; height: number; width: number; zoom: number };
  paths: ReadonlyArray<FramedPath>;
  top?: number;
  width: number;
  zoom: number;
}) {
  const liveCenter = mapState?.center ?? center;
  const liveZoom = mapState?.zoom ?? zoom;
  const centerRef = mercatorRefPoint(liveCenter);
  const scale = 2 ** (liveZoom - MERCATOR_REF_ZOOM);
  const translateX = (left ?? (mapState?.width ?? width) / 2) - centerRef.x * scale;
  const translateY = (top ?? (mapState?.height ?? height) / 2) - centerRef.y * scale;
  const zoomFactor = Math.max(0, Math.min(1, (liveZoom - 4) / (15 - 4)));

  return (
    <svg aria-hidden="true" data-atlas-overlay="">
      <g
        transform={`translate(${translateX.toFixed(2)} ${translateY.toFixed(2)}) scale(${scale.toFixed(6)})`}
      >
        <RouteSvgPaths
          casingOpacity={0.8}
          casingStroke={dark ? 'var(--black)' : 'var(--cream)'}
          casingWidth={2 + zoomFactor * 5}
          lineWidth={1 + zoomFactor * 2.5}
          paths={paths}
        />
      </g>
    </svg>
  );
}

type ViewportSnapshot = { boundsKey: string; center: Point; zoom: number };

type RouteAtlasMapProps = {
  bounds: GeoBounds;
  fitKey?: number;
  label: string;
  onCenterChange?: (center: Point) => void;
  routes: ReadonlyArray<MapRoute>;
  tileSource: TileSource;
  view?: GeoBounds | null;
};

const visibleKeyOf = (visible: ReadonlySet<number> | null) =>
  visible ? [...visible].toSorted((a, b) => a - b).join(',') : '*';

const distinctTonesOf = (routes: ReadonlyArray<DecodedRoute>): Array<FramedPath> =>
  [...new Set(routes.map(({ tone }) => tone))].map((tone) => ({ d: '', tone }));

export function RouteAtlasMap({
  bounds,
  fitKey = 0,
  label,
  onCenterChange,
  routes,
  tileSource,
  view = null,
}: RouteAtlasMapProps) {
  const hostRef = useRef<HTMLElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const preRenderRef = useRef<((center: Point, zoom: number) => void) | null>(null);
  const visible = use(VisibleRoutes);
  const dark = useDarkMap();
  const [canvasReady, setCanvasReady] = useState(false);
  const activeBounds = view ?? bounds;
  const boundsKey = `${fitKey}:${activeBounds[0][0]},${activeBounds[0][1]}:${activeBounds[1][0]},${activeBounds[1][1]}`;

  const size = useHostSize(hostRef, DEFAULT_SIZE, { round: true });
  const [viewportState, setViewportState] = useState<ViewportSnapshot | null>(null);

  const decodedRef = useRef<{
    decoded: Array<DecodedRoute>;
    routes: typeof routes;
    tones: Array<string>;
    workerRoutes: Array<WorkerRouteEntry>;
  } | null>(null);
  if (!decodedRef.current || decodedRef.current.routes !== routes) {
    const decoded = decodeRoutes(routes);
    decodedRef.current = {
      decoded,
      routes,
      tones: [...new Set(decoded.map(({ tone }) => tone))],
      workerRoutes: buildWorkerRoutes(decoded),
    };
  }
  const pathsRef = useRef<{
    canvasReady: boolean;
    paths: Array<FramedPath>;
    routes: typeof routes;
    visible: typeof visible;
    visibleKey: string;
  } | null>(null);
  if (
    !pathsRef.current ||
    pathsRef.current.routes !== routes ||
    pathsRef.current.visible !== visible ||
    pathsRef.current.canvasReady !== canvasReady
  ) {
    const visibleKey =
      pathsRef.current && pathsRef.current.visible === visible
        ? pathsRef.current.visibleKey
        : visibleKeyOf(visible);
    if (
      !pathsRef.current ||
      pathsRef.current.routes !== routes ||
      pathsRef.current.visibleKey !== visibleKey ||
      pathsRef.current.canvasReady !== canvasReady
    ) {
      const decoded = decodedRef.current.decoded;
      const filtered = visible ? decoded.filter(({ id }) => visible.has(id)) : decoded;
      pathsRef.current = {
        canvasReady,
        paths: canvasReady ? distinctTonesOf(filtered) : mercatorPaths(filtered),
        routes,
        visible,
        visibleKey,
      };
    } else {
      pathsRef.current.visible = visible;
    }
  }

  const defaultFrame = frameAround(activeBounds, {
    height: size.height,
    padding: FIT_PADDING,
    width: size.width,
  });
  const customViewport = viewportState?.boundsKey === boundsKey ? viewportState : null;
  const activeCenter = customViewport?.center ?? defaultFrame.center;
  const activeZoom = customViewport?.zoom ?? defaultFrame.zoom;
  const paths = pathsRef.current.paths;
  const visibleKey = pathsRef.current.visibleKey;

  const initialBasis = computeTransformBasis(activeCenter, activeZoom, size.width, size.height);
  const basisRef = useRef<TransformBasis>(initialBasis);
  const liveBasisRef = useRef<TransformBasis>(initialBasis);
  liveBasisRef.current = initialBasis;

  const gestureRef = useRef({
    animFrame: null as number | null,
    boundsKey,
    cachedRect: null as DOMRect | null,
    defaultCenter: defaultFrame.center,
    defaultZoom: defaultFrame.zoom,
    dragging: false,
    dragStartCenterRef: { x: 0, y: 0 },
    dragStartX: 0,
    dragStartY: 0,
    height: size.height,
    liveCenter: activeCenter,
    liveZoom: activeZoom,
    onCenterChange,
    settledCenter: activeCenter,
    settledZoom: activeZoom,
    targetCenter: activeCenter,
    targetZoom: activeZoom,
    wheelTimer: null as ReturnType<typeof setTimeout> | null,
    width: size.width,
  });

  const g = gestureRef.current;
  g.boundsKey = boundsKey;
  g.defaultCenter = defaultFrame.center;
  g.defaultZoom = defaultFrame.zoom;
  g.width = size.width;
  g.height = size.height;
  g.onCenterChange = onCenterChange;
  if (!g.dragging && g.animFrame === null && g.wheelTimer === null) {
    g.settledCenter = activeCenter;
    g.settledZoom = activeZoom;
    g.liveCenter = activeCenter;
    g.liveZoom = activeZoom;
    g.targetCenter = activeCenter;
    g.targetZoom = activeZoom;
  }

  useEffect(() => {
    if (tilesRef.current) {
      tilesRef.current.style.transform = '';
    }
    const settled = computeTransformBasis(activeCenter, activeZoom, size.width, size.height);
    liveBasisRef.current = settled;
    applyRelativeTransform(canvasRef.current, settled, basisRef.current);
  }, [activeCenter, activeZoom, size.height, size.width]);

  const syncGestureTransform = (nextCenter: Point, nextZoom: number) => {
    g.liveCenter = nextCenter;
    g.liveZoom = nextZoom;
    const settledBasis = computeTransformBasis(g.settledCenter, g.settledZoom, g.width, g.height);
    const liveBasis = computeTransformBasis(nextCenter, nextZoom, g.width, g.height);
    liveBasisRef.current = liveBasis;
    applyRelativeTransform(tilesRef.current, liveBasis, settledBasis);
    applyRelativeTransform(canvasRef.current, liveBasis, basisRef.current);
  };

  const commitGesture = (nextCenter: Point, nextZoom: number, isReset: boolean) => {
    g.settledCenter = nextCenter;
    g.settledZoom = nextZoom;
    g.liveCenter = nextCenter;
    g.liveZoom = nextZoom;
    g.targetCenter = nextCenter;
    g.targetZoom = nextZoom;
    if (tilesRef.current) {
      tilesRef.current.style.transform = '';
    }
    const nextBasis = computeTransformBasis(nextCenter, nextZoom, g.width, g.height);
    liveBasisRef.current = nextBasis;
    applyRelativeTransform(canvasRef.current, nextBasis, basisRef.current);
    if (isReset) {
      setViewportState(null);
    } else {
      setViewportState({ boundsKey: g.boundsKey, center: nextCenter, zoom: nextZoom });
      g.onCenterChange?.(nextCenter);
    }
  };

  useEffect(() => {
    const tilesEl = tilesRef.current;
    if (!tilesEl) {
      return;
    }
    const st = gestureRef.current;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (st.animFrame !== null) {
        cancelAnimationFrame(st.animFrame);
        st.animFrame = null;
      }
      st.cachedRect ??= tilesEl.getBoundingClientRect();
      const px = event.clientX - st.cachedRect.left;
      const py = event.clientY - st.cachedRect.top;
      const addToZoom = -event.deltaY / WHEEL_PIXELS_PER_ZOOM;
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, st.liveZoom + addToZoom));
      const prevScale = 2 ** (st.liveZoom - MERCATOR_REF_ZOOM);
      const nextScale = 2 ** (nextZoom - MERCATOR_REF_ZOOM);
      const liveRef = mercatorRefPoint(st.liveCenter);
      const cursorRefX = liveRef.x + (px - st.width / 2) / prevScale;
      const cursorRefY = liveRef.y + (py - st.height / 2) / prevScale;
      const nextCenter = unprojectMercatorRef({
        x: cursorRefX - (px - st.width / 2) / nextScale,
        y: cursorRefY - (py - st.height / 2) / nextScale,
      });
      st.targetCenter = nextCenter;
      st.targetZoom = nextZoom;
      syncGestureTransform(nextCenter, nextZoom);
      if (st.wheelTimer !== null) {
        clearTimeout(st.wheelTimer);
      }
      st.wheelTimer = setTimeout(() => {
        st.wheelTimer = null;
        st.cachedRect = null;
        commitGesture(st.liveCenter, st.liveZoom, false);
      }, WHEEL_SETTLE_MS);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      if (st.animFrame !== null) {
        cancelAnimationFrame(st.animFrame);
        st.animFrame = null;
      }
      if (st.wheelTimer !== null) {
        clearTimeout(st.wheelTimer);
        st.wheelTimer = null;
      }
      st.dragging = true;
      st.dragStartX = event.clientX;
      st.dragStartY = event.clientY;
      st.dragStartCenterRef = mercatorRefPoint(st.liveCenter);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!st.dragging) return;
      const scale = 2 ** (st.liveZoom - MERCATOR_REF_ZOOM);
      const nextCenter = unprojectMercatorRef({
        x: st.dragStartCenterRef.x - (event.clientX - st.dragStartX) / scale,
        y: st.dragStartCenterRef.y - (event.clientY - st.dragStartY) / scale,
      });
      st.targetCenter = nextCenter;
      syncGestureTransform(nextCenter, st.liveZoom);
    };

    const handleMouseUp = () => {
      if (!st.dragging) return;
      st.dragging = false;
      commitGesture(st.liveCenter, st.liveZoom, false);
    };

    tilesEl.addEventListener('wheel', handleWheel, { passive: false });
    tilesEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      if (st.wheelTimer !== null) clearTimeout(st.wheelTimer);
      if (st.animFrame !== null) cancelAnimationFrame(st.animFrame);
      tilesEl.removeEventListener('wheel', handleWheel);
      tilesEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });

  const animateButtonZoom = (targetCenter: Point, targetZoom: number, isReset: boolean) => {
    if (typeof Worker === 'undefined') {
      commitGesture(targetCenter, targetZoom, isReset);
      return;
    }
    if (g.wheelTimer !== null) {
      clearTimeout(g.wheelTimer);
      g.wheelTimer = null;
    }
    if (g.animFrame !== null) {
      cancelAnimationFrame(g.animFrame);
      g.animFrame = null;
    }
    g.targetCenter = targetCenter;
    g.targetZoom = targetZoom;
    preRenderRef.current?.(targetCenter, targetZoom);

    const startRef = mercatorRefPoint(g.liveCenter);
    const endRef = mercatorRefPoint(targetCenter);
    const startZoom = g.liveZoom;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - startTime) / BUTTON_ANIM_MS));
      const eased = t * (2 - t);
      if (t >= 1) {
        g.animFrame = null;
        commitGesture(targetCenter, targetZoom, isReset);
        return;
      }
      syncGestureTransform(
        unprojectMercatorRef({
          x: startRef.x + (endRef.x - startRef.x) * eased,
          y: startRef.y + (endRef.y - startRef.y) * eased,
        }),
        startZoom + (targetZoom - startZoom) * eased,
      );
      g.animFrame = requestAnimationFrame(step);
    };
    g.animFrame = requestAnimationFrame(step);
  };

  return (
    <section aria-label={label} data-atlas-map="" ref={hostRef}>
      <div data-atlas-tiles="" data-dark={dark ? 'true' : undefined} ref={tilesRef}>
        <PigeonMapCore
          animate={false}
          attribution={false}
          center={activeCenter}
          defaultCenter={defaultFrame.center}
          defaultHeight={DEFAULT_SIZE.height}
          defaultWidth={DEFAULT_SIZE.width}
          defaultZoom={defaultFrame.zoom}
          dprs={tileSource.mode === 'offline' ? [] : [1, 2]}
          maxZoom={MAX_ZOOM}
          metaWheelZoom={false}
          metaWheelZoomWarning=""
          minZoom={MIN_ZOOM}
          mouseEvents={false}
          provider={(x, y, tileZoom, dpr) =>
            outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tileZoom })
          }
          tileComponent={SmoothTile}
          twoFingerDrag={true}
          zoom={activeZoom}
          zoomSnap={false}
        >
          <AtlasRoutesOverlay
            center={activeCenter}
            dark={dark}
            height={size.height}
            paths={paths}
            width={size.width}
            zoom={activeZoom}
          />
        </PigeonMapCore>
      </div>
      <AtlasRoutesCanvas
        basisRef={basisRef}
        canvasRef={canvasRef}
        center={activeCenter}
        dark={dark}
        height={size.height}
        hostRef={hostRef}
        liveBasisRef={liveBasisRef}
        onCanvasReady={() => setCanvasReady(true)}
        preRenderRef={preRenderRef}
        tones={decodedRef.current.tones}
        visible={visible}
        visibleKey={visibleKey}
        width={size.width}
        workerRoutes={decodedRef.current.workerRoutes}
        zoom={activeZoom}
      />
      <ZoomControls
        onReset={() => animateButtonZoom(defaultFrame.center, defaultFrame.zoom, true)}
        onZoomIn={() =>
          animateButtonZoom(g.targetCenter, Math.min(MAX_ZOOM, g.targetZoom + 1), false)
        }
        onZoomOut={() =>
          animateButtonZoom(g.targetCenter, Math.max(MIN_ZOOM, g.targetZoom - 1), false)
        }
      />
    </section>
  );
}
