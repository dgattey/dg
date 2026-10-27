'use client';

import type { Point } from 'pigeon-maps';
import { use, useEffect, useRef, useState } from 'react';
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
import { frameTiles } from './SmoothTile';
import type { TileSource } from './tileSource';
import { useDarkMap } from './useDarkMap';
import { ZoomControls } from './ZoomControls';

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const REF_ZOOM = 12;
const REF_SCALE = 256 * 2 ** REF_ZOOM;
const W = 780;
const H = 940;

type Basis = { scale: number; tx: number; ty: number };
type RefViewport = { x: number; y: number; zoom: number };

const refOf = (pt: Point) => ({ x: project(pt).x * REF_SCALE, y: project(pt).y * REF_SCALE });

const toLatLng = ({ x, y }: { x: number; y: number }): Point =>
  unproject({
    x: Math.max(0, Math.min(1, x / REF_SCALE)),
    y: Math.max(0.05, Math.min(0.95, y / REF_SCALE)),
  });

const basisOf = (v: RefViewport): Basis => {
  const scale = 2 ** (v.zoom - REF_ZOOM);
  return { scale, tx: W / 2 - v.x * scale, ty: H / 2 - v.y * scale };
};

const applyTransform = (el: HTMLElement | null, live: Basis, base: Basis, cw = W, ch = H) => {
  if (!el) return;
  const s = live.scale / base.scale;
  const tx = (live.tx - base.tx * s) * (cw / W);
  const ty = (live.ty - base.ty * s) * (ch / H);
  el.style.transform =
    Math.abs(s - 1) < 1e-5 && Math.abs(tx) < 0.05 && Math.abs(ty) < 0.05
      ? ''
      : `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px) scale(${s.toFixed(5)})`;
};

const WORKER_SCRIPT = `let allRoutes = [], offscreen = null, ctx = null;
const PAL = {
  light: [['#2c4db0',0.36,0.9],['#2658c8',0.66,1],['#7cc4ff',0.94,1],['#e0f2ff',0.98,1.12]],
  dark: [['#457ae0',0.36,0.9],['#5896f5',0.66,1],['#94d2ff',0.94,1],['#e6f5ff',0.98,1.12]],
};
function packLeg(leg) {
  const pts = []; let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, px = -999999, py = -999999;
  for (let i = 0; i < leg.length; i++) { const x = Math.round(leg[i].x), y = Math.round(leg[i].y); if (x === px && y === py) continue; px = x; py = y; pts.push(x, y); if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  return { minX, maxX, minY, maxY, coords: new Int32Array(pts) };
}
self.onmessage = ({ data: msg }) => {
  if (msg.type === 'routes') { allRoutes = msg.routes.map((r) => ({ id: r.id, chunks: r.legs.map(packLeg).filter((c) => c.coords.length >= 4) })); return; }
  if (msg.type !== 'render') return;
  const { id, width, height, dpr, scale, tx, ty, bScale, bTx, bTy, dark, zf, visibleIds } = msg, pw = Math.max(1, Math.round(width * dpr)), ph = Math.max(1, Math.round(height * dpr));
  if (!offscreen || offscreen.width !== pw || offscreen.height !== ph) { offscreen = new OffscreenCanvas(pw, ph); ctx = offscreen.getContext('2d'); }
  if (!ctx) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
  const vis = visibleIds ? new Set(visibleIds) : null, m = 16, vMinX = (-tx - m) / scale, vMaxX = (width - tx + m) / scale, vMinY = (-ty - m) / scale, vMaxY = (height - ty + m) / scale;
  const gw = (width + 32) >> 2, gh = (height + 32) >> 2, grid = new Uint16Array(gw * gh), stamp = new Int32Array(gw * gh), seen = new Set(), segs = [];
  let maxCount = 1, routeIdx = 0;
  for (const route of allRoutes) { if (vis && !vis.has(route.id)) continue; routeIdx++; for (const ch of route.chunks) { if (ch.maxX < vMinX || ch.minX > vMaxX || ch.maxY < vMinY || ch.minY > vMaxY) continue; const coords = ch.coords; let prevX = -999999, prevY = -999999; for (let j = 0; j < coords.length; j += 2) { const sx = Math.round(coords[j] * scale + tx), sy = Math.round(coords[j + 1] * scale + ty); if (sx === prevX && sy === prevY) continue; if (prevX !== -999999 && !((prevX < -m || prevX > width + m || prevY < -m || prevY > height + m) && (sx < -m || sx > width + m || sy < -m || sy > height + m))) { const gx = (((prevX + sx) >> 1) + m) >> 2, gy = (((prevY + sy) >> 1) + m) >> 2; if (gx >= 0 && gx < gw && gy >= 0 && gy < gh) { const idx = gy * gw + gx; if (stamp[idx] !== routeIdx) { stamp[idx] = routeIdx; const c = ++grid[idx]; if (c > maxCount) maxCount = c; } const k = prevX < sx || (prevX === sx && prevY < sy) ? ((prevX & 0xfff) << 20) ^ ((prevY & 0xfff) << 10) ^ ((sx & 0xfff) << 5) ^ (sy & 0xfff) : ((sx & 0xfff) << 20) ^ ((sy & 0xfff) << 10) ^ ((prevX & 0xfff) << 5) ^ (prevY & 0xfff); if (!seen.has(k)) { seen.add(k); segs.push(prevX, prevY, sx, sy, idx); } } } prevX = sx; prevY = sy; } } }
  if (segs.length > 0) {
    const logMax = Math.log(Math.max(maxCount, 6)), tiers = [new Path2D(), new Path2D(), new Path2D(), new Path2D()], hasTier = [false, false, false, false], lx = [-999999,-999999,-999999,-999999], ly = [-999999,-999999,-999999,-999999];
    for (let i = 0; i < segs.length; i += 5) { const c = grid[segs[i + 4]], u = c <= 1 ? 0 : Math.log(c) / logMax, t = u <= 0 ? 0 : u < 0.48 ? 1 : u < 0.78 ? 2 : 3, x0 = segs[i], y0 = segs[i + 1], x1 = segs[i + 2], y1 = segs[i + 3]; hasTier[t] = true; if (lx[t] !== x0 || ly[t] !== y0) tiers[t].moveTo(x0, y0); tiers[t].lineTo(x1, y1); lx[t] = x1; ly[t] = y1; }
    const baseW = 0.8 + zf * 1.5, pal = dark ? PAL.dark : PAL.light;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (hasTier[0] || hasTier[1]) { const casing = new Path2D(); if (hasTier[0]) casing.addPath(tiers[0]); if (hasTier[1]) casing.addPath(tiers[1]); ctx.strokeStyle = dark ? '#0c1424' : '#f7f1e2'; ctx.globalAlpha = 0.42; ctx.lineWidth = baseW * 1.85; ctx.stroke(casing); }
    if (hasTier[2] || hasTier[3]) { const sheath = new Path2D(); if (hasTier[2]) sheath.addPath(tiers[2]); if (hasTier[3]) sheath.addPath(tiers[3]); ctx.strokeStyle = dark ? '#2354cf' : '#193b96'; ctx.globalAlpha = 0.88; ctx.lineWidth = baseW * 2.05; ctx.stroke(sheath); }
    for (let t = 0; t < 4; t++) { if (!hasTier[t]) continue; const [color, alpha, wMul] = pal[t]; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = baseW * wMul; ctx.stroke(tiers[t]); }
  }
  const bitmap = offscreen.transferToImageBitmap(); self.postMessage({ id, scale: bScale, tx: bTx, ty: bTy, width, height, dpr, bitmap }, [bitmap]);
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
  const [viewport, setViewport] = useState<{ boundsKey: string; v: RefViewport } | null>(null);

  const visibleRoutes = routes.filter((r) => !visible || visible.has(r.id));
  const activeTones = [...new Set(visibleRoutes.map((r) => r.tone))];
  const defaultFrame = frameAround(activeBounds, { height: H, padding: 36, width: W });
  const defaultRef: RefViewport = { ...refOf(defaultFrame.center), zoom: defaultFrame.zoom };
  const activeRef = viewport?.boundsKey === boundsKey ? viewport.v : defaultRef;
  const settledBasis = basisOf(activeRef);

  const ssrPathRef = useRef<string | null>(null);
  if (ssrPathRef.current === null) {
    const ssrFrame = { ...defaultFrame, height: H / 2, width: W / 2, zoom: defaultFrame.zoom - 1 };
    const ssrDecoded = decodeRoutes(visibleRoutes.map((r) => ({ ...r, tone: 'ink' })));
    ssrPathRef.current = framePaths(ssrFrame, ssrDecoded, 4, 1.5)[0]?.d ?? '';
  }

  const stRef = useRef({
    basis: settledBasis,
    cachedRect: null as DOMRect | null,
    ch: H,
    cw: W,
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
    if (!st.worker || !canvas) return onReady?.();
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
    if (st.lastKey === key) {
      applyTransform(canvas, basisOf(st.live), st.basis, st.cw, st.ch);
      return onReady?.();
    }
    st.lastKey = key;
    const zf = Math.max(0, Math.min(1, (target.zoom - 4) / (15 - 4)));
    st.reqId += 1;
    st.onReady = onReady ?? null;
    const msg = Object.assign(
      { bScale: basis.scale, bTx: basis.tx, bTy: basis.ty, dark, zf },
      { dpr: Math.min(2, window.devicePixelRatio || 1), height: H, id: st.reqId, width: W },
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
    const prev = basisOf(st.settled);
    const next = basisOf(target);
    const same =
      Math.abs(next.scale - prev.scale) < 1e-5 &&
      Math.abs(next.tx - prev.tx) < 0.25 &&
      Math.abs(next.ty - prev.ty) < 0.25;
    if (!isReset && same) {
      st.live = st.settled;
      if (tilesRef.current) tilesRef.current.style.transform = '';
      applyTransform(canvasRef.current, prev, st.basis, st.cw, st.ch);
      return;
    }
    st.syncLive(target);
    const commit = () => {
      st.live = target;
      st.settled = target;
      if (tilesRef.current) tilesRef.current.style.transform = '';
      applyTransform(canvasRef.current, next, st.basis, st.cw, st.ch);
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
        applyTransform(canvas, basisOf(s.live), s.basis, s.cw, s.ch);
        cb?.();
      };
      worker.onerror = () => {
        s.onReady?.();
        s.onReady = null;
      };
    }
    if (!tilesEl) return;
    s.cw = tilesEl.clientWidth || W;
    s.ch = tilesEl.clientHeight || H;
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
      const x = s.live.x + ((e.clientX - r.left) / r.width - 0.5) * W * sd;
      const y = s.live.y + ((e.clientY - r.top) / r.height - 0.5) * H * sd;
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
      const x = s.dragStart.x - ((e.clientX - s.dragStart.clientX) * (W / s.cw)) / scale;
      const y = s.dragStart.y - ((e.clientY - s.dragStart.clientY) * (H / s.ch)) / scale;
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
    applyTransform(canvasRef.current, settledBasis, st.basis, st.cw, st.ch);
    dispatchRender(activeRef);
  });

  return (
    <section aria-label={label} data-atlas-map="" ref={hostRef}>
      <div data-atlas-tiles="" data-dark={dark ? 'true' : undefined} ref={tilesRef}>
        {frameTiles({
          center: toLatLng(activeRef),
          dark,
          height: H,
          tileSource,
          width: W,
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
        onReset={() => st.settleTo(defaultRef, true)}
        onZoomIn={() => st.settleTo({ ...st.live, zoom: Math.min(MAX_ZOOM, st.live.zoom + 1) })}
        onZoomOut={() => st.settleTo({ ...st.live, zoom: Math.max(MIN_ZOOM, st.live.zoom - 1) })}
      />
    </section>
  );
}
