'use client';

import type { Point } from 'pigeon-maps';
import { use, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { VisibleRoutes } from '../VisibleRoutes';
import {
  ATLAS_H,
  ATLAS_W,
  applyTransform,
  basisOf,
  REF_ZOOM,
  type RefViewport,
  refOf,
  toLatLng,
} from './atlasViewport';
import {
  decodeRoutes,
  frameAround,
  framePaths,
  type GeoBounds,
  type MapRoute,
  routeLegs,
} from './routeFrame';
import { WORKER_SCRIPT } from './routeHeatmapWorker';
import { frameTiles, preloadTiles, tileGrid } from './SmoothTile';
import type { TileSource } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const ZOOM_ANIMATION_MS = 240;
const FRAME_MS = 1000 / 60;

type RouteAtlasMapProps = {
  bounds: GeoBounds;
  fitKey?: number;
  label: string;
  onCenterChange?: (center: Point) => void;
  routes: ReadonlyArray<MapRoute>;
  tileSource: TileSource;
  view?: GeoBounds | null;
};

export function RouteAtlasMap(props: RouteAtlasMapProps) {
  const { bounds, fitKey = 0, label, onCenterChange, routes, tileSource, view = null } = props;
  const hostRef = useRef<HTMLElement>(null);
  const tilesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ssrRef = useRef<SVGSVGElement>(null);
  const visible = use(VisibleRoutes);
  const dark = useDarkMap();
  const activeBounds = view ?? bounds;
  const boundsKey = `${fitKey}:${activeBounds[0][0]},${activeBounds[0][1]}:${activeBounds[1][0]},${activeBounds[1][1]}`;
  const [viewport, setViewport] = useState<{ boundsKey: string; v: RefViewport } | null>(null);

  const visibleRoutes = routes.filter((r) => !visible || visible.has(r.id));
  const activeTones = [...new Set(visibleRoutes.map((r) => r.tone))];
  const defaultFrame = frameAround(activeBounds, { height: ATLAS_H, padding: 36, width: ATLAS_W });
  const defaultRef: RefViewport = { ...refOf(defaultFrame.center), zoom: defaultFrame.zoom };
  const activeRef = viewport?.boundsKey === boundsKey ? viewport.v : defaultRef;
  const settledBasis = basisOf(activeRef);

  const ssrPathRef = useRef<string | null>(null);
  if (ssrPathRef.current === null) {
    const ssrFrame = {
      ...defaultFrame,
      height: ATLAS_H / 2,
      width: ATLAS_W / 2,
      zoom: defaultFrame.zoom - 1,
    };
    const ssrDecoded = decodeRoutes(visibleRoutes.map((r) => ({ ...r, tone: 'ink' })));
    ssrPathRef.current = framePaths(ssrFrame, ssrDecoded, 4, 1.5)[0]?.d ?? '';
  }

  const stRef = useRef({
    animateTo: (_target: RefViewport, _isReset?: boolean) => {},
    animation: null as object | null,
    basis: settledBasis,
    boundsKey,
    cachedRect: null as DOMRect | null,
    ch: ATLAS_H,
    cw: ATLAS_W,
    dragging: false,
    dragStart: { clientX: 0, clientY: 0, x: 0, y: 0 },
    goal: activeRef,
    lastKey: '',
    live: activeRef,
    pending: null as RefViewport | null,
    reqId: 0,
    sentRoutes: null as ReadonlyArray<MapRoute> | null,
    settled: activeRef,
    settleTo: (_target: RefViewport, _isReset?: boolean) => {},
    syncLive: (_next: RefViewport) => {},
    wheelTimer: null as ReturnType<typeof setTimeout> | null,
    worker: null as Worker | null,
  });

  const st = stRef.current;
  if (st.boundsKey !== boundsKey) {
    st.boundsKey = boundsKey;
    st.animation = null;
    st.pending = null;
  }
  if (!st.dragging && st.wheelTimer === null && st.pending === null && st.animation === null) {
    st.settled = activeRef;
    st.live = activeRef;
  }

  const gridOf = (v: RefViewport) =>
    tileGrid({
      center: toLatLng(v),
      dark,
      height: ATLAS_H,
      tileSource,
      width: ATLAS_W,
      zoom: v.zoom,
    });

  const dispatchRender = (target: RefViewport) => {
    const canvas = canvasRef.current;
    if (!st.worker || !canvas) return;
    if (st.sentRoutes !== routes) {
      st.sentRoutes = routes;
      const packed = decodeRoutes(routes).map(({ id, points }) => ({
        id,
        legs: routeLegs(points).map((leg) => leg.map(refOf)),
      }));
      st.worker.postMessage({ routes: packed, type: 'routes' });
    }
    const basis = basisOf(target);
    const key = `${visible ? [...visible].join(',') : '*'}|${dark ? 1 : 0}|${basis.tx.toFixed(2)},${basis.ty.toFixed(2)},${basis.scale.toFixed(6)}`;
    if (st.lastKey === key) return;
    st.lastKey = key;
    const zf = Math.max(0, Math.min(1, (target.zoom - 4) / (15 - 4)));
    st.reqId += 1;
    const msg = Object.assign(
      { bScale: basis.scale, bTx: basis.tx, bTy: basis.ty, dark, zf },
      {
        dpr: Math.min(2, window.devicePixelRatio || 1),
        height: ATLAS_H,
        id: st.reqId,
        width: ATLAS_W,
      },
      { scale: basis.scale, tx: basis.tx, ty: basis.ty },
      { type: 'render', visibleIds: visible ? [...visible] : null },
    );
    st.worker.postMessage(msg);
  };

  st.syncLive = (next: RefViewport) => {
    st.live = next;
    const liveBasis = basisOf(next);
    applyTransform(tilesRef.current, liveBasis, basisOf(st.settled), st.cw, st.ch);
    applyTransform(canvasRef.current, liveBasis, st.basis, st.cw, st.ch);
  };

  st.settleTo = (target: RefViewport, isReset = false) => {
    if (st.wheelTimer !== null) clearTimeout(st.wheelTimer);
    st.wheelTimer = null;
    st.animation = null;
    const prev = basisOf(st.settled);
    const next = basisOf(target);
    const same =
      Math.abs(next.scale - prev.scale) < 1e-5 &&
      Math.abs(next.tx - prev.tx) < 0.25 &&
      Math.abs(next.ty - prev.ty) < 0.25;
    if (!isReset && same) {
      st.pending = null;
      st.syncLive(st.settled);
      return;
    }
    st.pending = target;
    st.syncLive(target);
    dispatchRender(target);
    // The old tiles keep moving with the routes until the new ones are decoded,
    // then both swap in one task so no frame shows a stale or blank tile.
    void preloadTiles(gridOf(target).tiles).then(() => {
      if (st.pending !== target || st.dragging || st.wheelTimer !== null) return;
      st.pending = null;
      st.settled = target;
      flushSync(() => setViewport(isReset ? null : { boundsKey, v: target }));
      st.syncLive(target);
      if (!isReset) onCenterChange?.(toLatLng(target));
    });
  };

  st.animateTo = (target: RefViewport, isReset = false) => {
    if (st.wheelTimer !== null) clearTimeout(st.wheelTimer);
    st.wheelTimer = null;
    const token = {};
    const from = st.live;
    let start: number | null = null;
    st.animation = token;
    st.goal = target;
    dispatchRender(target);
    void preloadTiles(gridOf(target).tiles);
    const step = (now: number) => {
      if (st.animation !== token) return;
      start ??= now - FRAME_MS;
      const t = Math.min(1, (now - start) / ZOOM_ANIMATION_MS);
      const e = 1 - (1 - t) ** 3;
      st.syncLive({
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        zoom: from.zoom + (target.zoom - from.zoom) * e,
      });
      if (t < 1) requestAnimationFrame(step);
      else st.settleTo(target, isReset);
    };
    step(performance.now());
  };

  const zoomBy = (delta: number) => {
    const from = st.animation ? st.goal : st.live;
    st.animateTo({ ...from, zoom: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, from.zoom + delta)) });
  };

  useEffect(() => {
    const hostEl = hostRef.current;
    const tilesEl = tilesRef.current;
    const s = stRef.current;
    let url = '';
    if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined') {
      url = URL.createObjectURL(new Blob([WORKER_SCRIPT], { type: 'application/javascript' }));
      const worker = new Worker(url);
      s.worker = worker;
      worker.onmessage = ({ data }) => {
        const { bitmap, dpr, height: bh, id, scale, tx, ty, width: bw } = data;
        const canvas = canvasRef.current;
        if (id < s.reqId || !canvas) return bitmap?.close?.();
        const pw = Math.max(1, Math.round(bw * dpr));
        const ph = Math.max(1, Math.round(bh * dpr));
        if (canvas.width !== pw || canvas.height !== ph)
          Object.assign(canvas, { height: ph, width: pw });
        canvas.getContext('bitmaprenderer')?.transferFromImageBitmap(bitmap);
        ssrRef.current?.remove();
        s.basis = { scale, tx, ty };
        applyTransform(canvas, basisOf(s.live), s.basis, s.cw, s.ch);
      };
    }
    if (!hostEl || !tilesEl) return;
    s.cw = tilesEl.clientWidth || ATLAS_W;
    s.ch = tilesEl.clientHeight || ATLAS_H;
    const clearWheel = () => {
      if (s.wheelTimer !== null) clearTimeout(s.wheelTimer);
      s.wheelTimer = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearWheel();
      s.animation = null;
      const r = s.cachedRect ?? hostEl.getBoundingClientRect();
      s.cachedRect = r;
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s.live.zoom - e.deltaY / 150));
      const sd = 1 / 2 ** (s.live.zoom - REF_ZOOM) - 1 / 2 ** (zoom - REF_ZOOM);
      const x = s.live.x + ((e.clientX - r.left) / r.width - 0.5) * ATLAS_W * sd;
      const y = s.live.y + ((e.clientY - r.top) / r.height - 0.5) * ATLAS_H * sd;
      s.syncLive({ x, y, zoom });
      s.wheelTimer = setTimeout(() => {
        Object.assign(s, { cachedRect: null, wheelTimer: null });
        s.settleTo(s.live);
      }, 140);
    };
    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      clearWheel();
      s.animation = null;
      s.dragging = true;
      s.dragStart = { clientX: e.clientX, clientY: e.clientY, x: s.live.x, y: s.live.y };
    };
    const onMove = (e: MouseEvent) => {
      if (!s.dragging) return;
      const scale = 2 ** (s.live.zoom - REF_ZOOM);
      const x = s.dragStart.x - ((e.clientX - s.dragStart.clientX) * (ATLAS_W / s.cw)) / scale;
      const y = s.dragStart.y - ((e.clientY - s.dragStart.clientY) * (ATLAS_H / s.ch)) / scale;
      s.syncLive({ x, y, zoom: s.live.zoom });
    };
    const onUp = () => {
      if (!s.dragging) return;
      s.dragging = false;
      s.settleTo(s.live);
    };
    tilesEl.addEventListener('wheel', onWheel, { passive: false });
    tilesEl.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      clearWheel();
      s.worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      Object.assign(s, {
        animation: null,
        lastKey: '',
        pending: null,
        sentRoutes: null,
        worker: null,
      });
      tilesEl.removeEventListener('wheel', onWheel);
      tilesEl.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    st.syncLive(st.live);
    dispatchRender(st.pending ?? st.settled);
  });

  return (
    <section aria-label={label} data-atlas-map="" ref={hostRef}>
      <div data-atlas-tiles="" data-dark={dark ? 'true' : undefined} ref={tilesRef}>
        {frameTiles({
          center: toLatLng(activeRef),
          dark,
          height: ATLAS_H,
          tileSource,
          width: ATLAS_W,
          zoom: activeRef.zoom,
        })}
      </div>
      {ssrPathRef.current ? (
        <svg
          aria-hidden="true"
          data-atlas-ssr=""
          preserveAspectRatio="none"
          ref={ssrRef}
          viewBox="0 0 390 470"
        >
          <path d={ssrPathRef.current} stroke="var(--cobalt)" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : null}
      <canvas
        data-atlas-canvas=""
        data-tones={activeTones.join(',')}
        data-transform={`translate(${settledBasis.tx.toFixed(2)} ${settledBasis.ty.toFixed(2)}) scale(${settledBasis.scale.toFixed(6)})`}
        ref={canvasRef}
      />
      <ZoomControls
        onReset={() => st.animateTo(defaultRef, true)}
        onZoomIn={() => zoomBy(1)}
        onZoomOut={() => zoomBy(-1)}
      />
    </section>
  );
}
