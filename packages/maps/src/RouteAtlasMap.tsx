'use client';

import type { Point } from 'pigeon-maps';
import { type CSSProperties, type ReactElement, use, useEffect, useRef, useState } from 'react';
import { VisibleRoutes } from '../VisibleRoutes';
import {
  decodeRoutes,
  frameAround,
  framePaths,
  type GeoBounds,
  type MapRoute,
  routeLegs,
} from './routeFrame';
import { project, unproject } from './routeGeometry';
import { SmoothTile, useHostSize } from './SmoothTile';
import { outdoorsTileUrl, type TileSource } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const REF_ZOOM = 12;
const REF_SCALE = 256 * 2 ** REF_ZOOM;
const NOOP = () => {};

type Basis = { scale: number; tx: number; ty: number };
type RefViewport = { x: number; y: number; zoom: number };

const refOf = (pt: Point) => ({ x: project(pt).x * REF_SCALE, y: project(pt).y * REF_SCALE });

const toLatLng = ({ x, y }: { x: number; y: number }): Point =>
  unproject({
    x: Math.max(0, Math.min(1, x / REF_SCALE)),
    y: Math.max(0.05, Math.min(0.95, y / REF_SCALE)),
  });

const basisOf = (v: RefViewport, width: number, height: number): Basis => {
  const scale = 2 ** (v.zoom - REF_ZOOM);
  return { scale, tx: width / 2 - v.x * scale, ty: height / 2 - v.y * scale };
};

const applyTransform = (el: HTMLElement | null, live: Basis, base: Basis) => {
  if (!el) return;
  const s = live.scale / base.scale;
  const tx = live.tx - base.tx * s;
  const ty = live.ty - base.ty * s;
  el.style.transform =
    Math.abs(s - 1) < 1e-5 && Math.abs(tx) < 0.05 && Math.abs(ty) < 0.05
      ? ''
      : `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px) scale(${s.toFixed(5)})`;
};

const cssColor = (styles: CSSStyleDeclaration, name: string, dark: boolean) => {
  const raw = styles.getPropertyValue(name).trim();
  const parts = raw.startsWith('light-dark(') ? raw.slice(11, -1).split(',') : null;
  return (parts ? parts[dark ? 1 : 0]?.trim() : raw) || '#1d1a15';
};

const WORKER_SCRIPT = `let allRoutes = [], offscreen = null, ctx = null;
function packLeg(leg) {
  const pts = []; let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, px = -999999, py = -999999;
  for (let i = 0; i < leg.length; i++) { const x = Math.round(leg[i].x), y = Math.round(leg[i].y); if (x === px && y === py) continue; px = x; py = y; pts.push(x, y); if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  return { minX, maxX, minY, maxY, coords: new Int32Array(pts) };
}
self.onmessage = ({ data: msg }) => {
  if (msg.type === 'routes') { allRoutes = msg.routes.map((r) => ({ id: r.id, tone: r.tone, chunks: r.legs.map(packLeg).filter((c) => c.coords.length >= 4) })); return; }
  if (msg.type !== 'render') return;
  const { id, width, height, dpr, scale, tx, ty, casingColor, casingWidth, lineWidth, toneColors, visibleIds } = msg, pw = Math.max(1, Math.round(width * dpr)), ph = Math.max(1, Math.round(height * dpr));
  if (!offscreen || offscreen.width !== pw || offscreen.height !== ph) { offscreen = new OffscreenCanvas(pw, ph); ctx = offscreen.getContext('2d'); }
  if (!ctx) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  const vis = visibleIds ? new Set(visibleIds) : null, m = 16, vMinX = (-tx - m) / scale, vMaxX = (width - tx + m) / scale, vMinY = (-ty - m) / scale, vMaxY = (height - ty + m) / scale, byTone = new Map(), seenByTone = new Map();
  for (const route of allRoutes) { if (vis && !vis.has(route.id)) continue; let p2 = byTone.get(route.tone), seen = seenByTone.get(route.tone); for (const ch of route.chunks) { if (ch.maxX < vMinX || ch.minX > vMaxX || ch.maxY < vMinY || ch.minY > vMaxY) continue; if (!p2) { p2 = new Path2D(); seen = new Set(); byTone.set(route.tone, p2); seenByTone.set(route.tone, seen); } const coords = ch.coords; let prevX = -999999, prevY = -999999, started = false; for (let j = 0; j < coords.length; j += 2) { const sx = Math.round(coords[j] * scale + tx), sy = Math.round(coords[j + 1] * scale + ty); if (sx === prevX && sy === prevY) continue; if (prevX !== -999999) { if ((prevX < -m || prevX > width + m || prevY < -m || prevY > height + m) && (sx < -m || sx > width + m || sy < -m || sy > height + m)) { started = false; prevX = sx; prevY = sy; continue; } const k = prevX < sx || (prevX === sx && prevY < sy) ? ((prevX & 0xfff) << 20) ^ ((prevY & 0xfff) << 10) ^ ((sx & 0xfff) << 5) ^ (sy & 0xfff) : ((sx & 0xfff) << 20) ^ ((sy & 0xfff) << 10) ^ ((prevX & 0xfff) << 5) ^ (prevY & 0xfff); if (seen.has(k)) { started = false; prevX = sx; prevY = sy; continue; } seen.add(k); if (!started) { p2.moveTo(prevX, prevY); started = true; } p2.lineTo(sx, sy); } prevX = sx; prevY = sy; } } }
  if (byTone.size > 0) { ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = casingColor; ctx.globalAlpha = 0.8; ctx.lineWidth = casingWidth; for (const p2 of byTone.values()) ctx.stroke(p2); ctx.globalAlpha = 1; ctx.lineWidth = lineWidth; for (const [tone, p2] of byTone.entries()) { ctx.strokeStyle = toneColors[tone] || '#2c4db0'; ctx.stroke(p2); } }
  const bitmap = offscreen.transferToImageBitmap(); self.postMessage({ id, scale, tx, ty, width, height, dpr, bitmap }, [bitmap]);
};`;

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
  const size = useHostSize(hostRef, { height: 979, width: 812 }, { round: true });
  const [viewport, setViewport] = useState<{ boundsKey: string; v: RefViewport } | null>(null);

  const visibleRoutes = routes.filter((r) => !visible || visible.has(r.id));
  const activeTones = [...new Set(visibleRoutes.map((r) => r.tone))];
  const defaultFrame = frameAround(activeBounds, { ...size, padding: 36 });
  const defaultRef: RefViewport = { ...refOf(defaultFrame.center), zoom: defaultFrame.zoom };
  const activeRef = viewport?.boundsKey === boundsKey ? viewport.v : defaultRef;
  const settledBasis = basisOf(activeRef, size.width, size.height);

  const ssrPathRef = useRef<string | null>(null);
  if (ssrPathRef.current === null) {
    const ssrFrame = { ...defaultFrame, height: 489.5, width: 406, zoom: defaultFrame.zoom - 1 };
    const ssrDecoded = decodeRoutes(visibleRoutes.map((r) => ({ ...r, tone: 'ink' })));
    ssrPathRef.current = framePaths(ssrFrame, ssrDecoded, 4, 1.5)[0]?.d ?? '';
  }

  const stRef = useRef({
    basis: settledBasis,
    cachedRect: null as DOMRect | null,
    dragging: false,
    dragStart: { clientX: 0, clientY: 0, x: 0, y: 0 },
    lastKey: '',
    live: activeRef,
    onReady: null as (() => void) | null,
    reqId: 0,
    sentRoutes: null as ReadonlyArray<MapRoute> | null,
    settled: activeRef,
    settleTo: (_target: RefViewport, _isReset?: boolean) => {},
    syncLive: (_next: RefViewport) => {},
    wheelTimer: null as ReturnType<typeof setTimeout> | null,
    worker: null as Worker | null,
  });

  const st = stRef.current;
  if (!st.dragging && st.wheelTimer === null) {
    st.settled = activeRef;
    st.live = activeRef;
  }

  const dispatchRender = (target: RefViewport, onReady?: () => void) => {
    const canvas = canvasRef.current;
    if (!st.worker || !canvas || size.width <= 0 || size.height <= 0) return onReady?.();
    if (st.sentRoutes !== routes) {
      st.sentRoutes = routes;
      const packed = decodeRoutes(routes).map(({ id, points, tone }) => ({
        id,
        legs: routeLegs(points).map((leg) => leg.map(refOf)),
        tone,
      }));
      st.worker.postMessage({ routes: packed, type: 'routes' });
    }
    const basis = basisOf(target, size.width, size.height);
    const key = `${visible ? [...visible].join(',') : '*'}|${dark ? 1 : 0}|${size.width}x${size.height}|${basis.tx.toFixed(2)},${basis.ty.toFixed(2)},${basis.scale.toFixed(6)}`;
    if (st.lastKey === key) {
      applyTransform(canvas, basisOf(st.live, size.width, size.height), st.basis);
      return onReady?.();
    }
    st.lastKey = key;
    const styles = getComputedStyle(canvas.closest('.collageRoot') ?? document.documentElement);
    const tones = [...new Set(routes.map((r) => r.tone))];
    const zf = Math.max(0, Math.min(1, (target.zoom - 4) / (15 - 4)));
    st.reqId += 1;
    st.onReady = onReady ?? null;
    const msg = Object.assign(
      { casingColor: cssColor(styles, dark ? '--black' : '--cream', dark) },
      { casingWidth: 2 + zf * 5, dpr: Math.min(2, window.devicePixelRatio || 1), id: st.reqId },
      { lineWidth: 1 + zf * 2.5, type: 'render', visibleIds: visible ? [...visible] : null },
      { toneColors: Object.fromEntries(tones.map((t) => [t, cssColor(styles, `--${t}`, dark)])) },
      basis,
      size,
    );
    st.worker.postMessage(msg);
  };

  st.syncLive = (next: RefViewport) => {
    st.live = next;
    const liveBasis = basisOf(next, size.width, size.height);
    applyTransform(tilesRef.current, liveBasis, basisOf(st.settled, size.width, size.height));
    applyTransform(canvasRef.current, liveBasis, st.basis);
  };

  st.settleTo = (target: RefViewport, isReset = false) => {
    if (st.wheelTimer !== null) clearTimeout(st.wheelTimer);
    st.wheelTimer = null;
    st.syncLive(target);
    const commit = () => {
      const prev = basisOf(st.settled, size.width, size.height);
      const next = basisOf(target, size.width, size.height);
      st.live = target;
      if (tilesRef.current) tilesRef.current.style.transform = '';
      applyTransform(canvasRef.current, next, st.basis);
      const same =
        Math.abs(next.scale - prev.scale) < 1e-5 &&
        Math.abs(next.tx - prev.tx) < 0.25 &&
        Math.abs(next.ty - prev.ty) < 0.25;
      if (!isReset && same) return;
      st.settled = target;
      if (isReset) return setViewport(null);
      setViewport({ boundsKey, v: target });
      onCenterChange?.(toLatLng(target));
    };
    if (!st.worker) return commit();
    dispatchRender(target, () => {
      if (!st.dragging && st.wheelTimer === null) commit();
    });
  };

  useEffect(() => {
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
        const cb = s.onReady;
        s.onReady = null;
        const pw = Math.max(1, Math.round(bw * dpr));
        const ph = Math.max(1, Math.round(bh * dpr));
        if (canvas.width !== pw || canvas.height !== ph)
          Object.assign(canvas, { height: ph, width: pw });
        canvas.getContext('bitmaprenderer')?.transferFromImageBitmap(bitmap);
        ssrRef.current?.remove();
        s.basis = { scale, tx, ty };
        applyTransform(canvas, basisOf(s.live, bw, bh), s.basis);
        cb?.();
      };
      worker.onerror = () => {
        s.onReady?.();
        s.onReady = null;
      };
    }
    if (!tilesEl) return;
    const clearWheel = () => {
      if (s.wheelTimer !== null) clearTimeout(s.wheelTimer);
      s.wheelTimer = null;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearWheel();
      const r = s.cachedRect ?? tilesEl.getBoundingClientRect();
      s.cachedRect = r;
      const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, s.live.zoom - e.deltaY / 150));
      const sd = 1 / 2 ** (s.live.zoom - REF_ZOOM) - 1 / 2 ** (zoom - REF_ZOOM);
      const x = s.live.x + (e.clientX - r.left - r.width / 2) * sd;
      const y = s.live.y + (e.clientY - r.top - r.height / 2) * sd;
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
      s.dragging = true;
      s.dragStart = { clientX: e.clientX, clientY: e.clientY, x: s.live.x, y: s.live.y };
    };
    const onMove = (e: MouseEvent) => {
      if (!s.dragging) return;
      const scale = 2 ** (s.live.zoom - REF_ZOOM);
      const x = s.dragStart.x - (e.clientX - s.dragStart.clientX) / scale;
      const y = s.dragStart.y - (e.clientY - s.dragStart.clientY) / scale;
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
      Object.assign(s, { lastKey: '', onReady: null, sentRoutes: null, worker: null });
      tilesEl.removeEventListener('wheel', onWheel);
      tilesEl.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    if (tilesRef.current) tilesRef.current.style.transform = '';
    applyTransform(canvasRef.current, settledBasis, st.basis);
    dispatchRender(activeRef);
  });

  const tz = Math.round(activeRef.zoom);
  const ts = 2 ** (activeRef.zoom - tz);
  const cx = activeRef.x / 256 / 2 ** (REF_ZOOM - tz);
  const cy = activeRef.y / 256 / 2 ** (REF_ZOOM - tz);
  const minX = Math.floor(cx - size.width / ts / 512);
  const maxX = Math.min(Math.floor(cx + size.width / ts / 512), 2 ** tz - 1);
  const minY = Math.floor(cy - size.height / ts / 512);
  const maxY = Math.min(Math.floor(cy + size.height / ts / 512), 2 ** tz - 1);
  const baseTile = { active: true, height: 256, width: 256 };
  const tiles: Array<ReactElement> = [];
  for (let x = Math.max(minX, 0); x <= maxX; x++) {
    for (let y = Math.max(minY, 0); y <= maxY; y++) {
      const url = (dpr?: number) => outdoorsTileUrl(tileSource, { dark, dpr, x, y, zoom: tz });
      const key = `${x}-${y}-${tz}`;
      const srcSet = tileSource.mode === 'offline' ? '' : `${url(1)}, ${url(2)} 2x`;
      const pos = { left: (x - minX) * 256, top: (y - minY) * 256 };
      const tile = { ...baseTile, ...pos, key, srcSet, url: url() };
      tiles.push(<SmoothTile key={key} tile={tile} tileLoaded={NOOP} />);
    }
  }
  const tileBoxTransform = `translate3d(${(settledBasis.tx + minX * 256 * ts).toFixed(2)}px, ${(settledBasis.ty + minY * 256 * ts).toFixed(2)}px, 0px) scale(${ts.toFixed(6)})`;

  return (
    <section aria-label={label} data-atlas-map="" ref={hostRef}>
      <div data-atlas-tiles="" data-dark={dark ? 'true' : undefined} ref={tilesRef}>
        <div
          data-atlas-tile-box=""
          style={{ '--atlas-tile-transform': tileBoxTransform } as CSSProperties}
        >
          {tiles}
        </div>
      </div>
      {ssrPathRef.current ? (
        <svg aria-hidden="true" data-atlas-ssr="" ref={ssrRef} viewBox="0 0 406 489.5">
          <path
            d={ssrPathRef.current}
            stroke={`var(--${activeTones[0] ?? 'cobalt'})`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
      <canvas
        data-atlas-canvas=""
        data-tones={activeTones.join(',')}
        data-transform={`translate(${settledBasis.tx.toFixed(2)} ${settledBasis.ty.toFixed(2)}) scale(${settledBasis.scale.toFixed(6)})`}
        ref={canvasRef}
      />
      <ZoomControls
        onReset={() => st.settleTo(defaultRef, true)}
        onZoomIn={() => st.settleTo({ ...st.live, zoom: Math.min(MAX_ZOOM, st.live.zoom + 1) })}
        onZoomOut={() => st.settleTo({ ...st.live, zoom: Math.max(MIN_ZOOM, st.live.zoom - 1) })}
      />
    </section>
  );
}
