'use client';

import type { Point } from 'pigeon-maps';
import { type RefObject, useEffect, useRef } from 'react';
import {
  type DecodedRoute,
  MERCATOR_REF_ZOOM,
  mercatorLegsOf,
  mercatorRefPoint,
  type RoundedLeg,
} from './routeFrame';

const MERCATOR_REF_SCALE = 256 * 2 ** MERCATOR_REF_ZOOM;

export type TransformBasis = { scale: number; tx: number; ty: number };

export type WorkerRouteEntry = { id: number; legs: ReadonlyArray<RoundedLeg>; tone: string };

export function computeTransformBasis(
  center: Point,
  zoom: number,
  width: number,
  height: number,
): TransformBasis {
  const centerRef = mercatorRefPoint(center);
  const scale = 2 ** (zoom - MERCATOR_REF_ZOOM);
  return { scale, tx: width / 2 - centerRef.x * scale, ty: height / 2 - centerRef.y * scale };
}

export function applyRelativeTransform(
  element: HTMLElement | null,
  live: TransformBasis,
  base: TransformBasis,
) {
  if (!element) return;
  const relScale = live.scale / base.scale;
  const relTx = live.tx - base.tx * relScale;
  const relTy = live.ty - base.ty * relScale;
  if (Math.abs(relScale - 1) < 1e-5 && Math.abs(relTx) < 0.05 && Math.abs(relTy) < 0.05) {
    element.style.transform = '';
    return;
  }
  element.style.transform = `translate3d(${relTx.toFixed(2)}px, ${relTy.toFixed(2)}px, 0px) scale(${relScale.toFixed(5)})`;
}

export function unprojectMercatorRef({ x, y }: { x: number; y: number }): Point {
  const nx = Math.max(0, Math.min(1, x / MERCATOR_REF_SCALE));
  const ny = Math.max(0.05, Math.min(0.95, y / MERCATOR_REF_SCALE));
  return [(Math.atan(Math.sinh(Math.PI * (1 - 2 * ny))) * 180) / Math.PI, nx * 360 - 180];
}

export function buildWorkerRoutes(decoded: ReadonlyArray<DecodedRoute>): Array<WorkerRouteEntry> {
  return decoded.map((r) => ({ id: r.id, legs: mercatorLegsOf(r), tone: r.tone }));
}

function resolveCssVarColor(styles: CSSStyleDeclaration, varName: string, dark: boolean): string {
  const raw = styles.getPropertyValue(varName).trim();
  if (raw.startsWith('light-dark(') && raw.endsWith(')')) {
    const [lightVal = '#1d1a15', darkVal = lightVal] = raw
      .slice('light-dark('.length, -1)
      .split(',')
      .map((s) => s.trim());
    return dark ? darkVal : lightVal;
  }
  return raw || '#1d1a15';
}

const WORKER_SCRIPT = `
let allRoutes = [], offscreen = null, ctx = null, cachedBitmaps = new Map();

function packLeg(leg) {
  const len = leg.length, coords = new Int32Array(len * 2);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < len; i++) {
    const x = leg[i][0], y = leg[i][1];
    coords[i * 2] = x; coords[i * 2 + 1] = y;
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return { minX, maxX, minY, maxY, coords };
}

function renderToBitmap({ width, height, dpr, scale, tx, ty, casingColor, casingWidth, lineWidth, toneColors, visibleIds }) {
  const pixelW = Math.max(1, Math.round(width * dpr));
  const pixelH = Math.max(1, Math.round(height * dpr));
  if (!offscreen || offscreen.width !== pixelW || offscreen.height !== pixelH) {
    offscreen = new OffscreenCanvas(pixelW, pixelH);
    ctx = offscreen.getContext('2d');
  }
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const visibleSet = visibleIds ? new Set(visibleIds) : null;
  const margin = 16;
  const vMinX = (-tx - margin) / scale, vMaxX = (width - tx + margin) / scale;
  const vMinY = (-ty - margin) / scale, vMaxY = (height - ty + margin) / scale;
  const byTone = new Map(), seenByTone = new Map();

  for (let r = 0; r < allRoutes.length; r++) {
    const route = allRoutes[r];
    if (visibleSet && !visibleSet.has(route.id)) continue;
    const chunks = route.chunks;
    let p2 = byTone.get(route.tone), seen = seenByTone.get(route.tone);
    for (let c = 0; c < chunks.length; c++) {
      const chunk = chunks[c];
      if (chunk.maxX < vMinX || chunk.minX > vMaxX || chunk.maxY < vMinY || chunk.minY > vMaxY) continue;
      if (!p2) {
        p2 = new Path2D(); seen = new Set();
        byTone.set(route.tone, p2); seenByTone.set(route.tone, seen);
      }
      const coords = chunk.coords;
      let prevX = -999999, prevY = -999999, started = false;
      for (let j = 0; j < coords.length; j += 2) {
        const sx = Math.round(coords[j] * scale + tx), sy = Math.round(coords[j + 1] * scale + ty);
        if (sx === prevX && sy === prevY) continue;
        if (prevX !== -999999) {
          const inBounds =
            (prevX >= -margin && prevX <= width + margin && prevY >= -margin && prevY <= height + margin) ||
            (sx >= -margin && sx <= width + margin && sy >= -margin && sy <= height + margin);
          if (!inBounds) { started = false; prevX = sx; prevY = sy; continue; }
          const ax = prevX, ay = prevY, bx = sx, by = sy;
          const edgeKey = ax < bx || (ax === bx && ay < by)
            ? ((ax & 0xfff) << 20) ^ ((ay & 0xfff) << 10) ^ ((bx & 0xfff) << 5) ^ (by & 0xfff)
            : ((bx & 0xfff) << 20) ^ ((by & 0xfff) << 10) ^ ((ax & 0xfff) << 5) ^ (ay & 0xfff);
          if (seen.has(edgeKey)) { started = false; prevX = sx; prevY = sy; continue; }
          seen.add(edgeKey);
          if (!started) { p2.moveTo(ax, ay); started = true; }
          p2.lineTo(bx, by);
        }
        prevX = sx; prevY = sy;
      }
    }
  }

  if (byTone.size > 0) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = casingColor; ctx.globalAlpha = 0.8; ctx.lineWidth = casingWidth;
    for (const p2 of byTone.values()) ctx.stroke(p2);
    ctx.globalAlpha = 1; ctx.lineWidth = lineWidth;
    for (const [tone, p2] of byTone.entries()) {
      ctx.strokeStyle = toneColors[tone] || '#2c4db0';
      ctx.stroke(p2);
    }
  }
  return offscreen.transferToImageBitmap();
}

self.onmessage = (event) => {
  const msg = event.data;
  if (msg.type === 'routes') {
    for (const bmp of cachedBitmaps.values()) bmp.close?.();
    cachedBitmaps.clear();
    allRoutes = msg.routes.map((r) => ({ id: r.id, tone: r.tone, chunks: r.legs.map(packLeg) }));
    return;
  }
  if (msg.type === 'prewarm') {
    if (cachedBitmaps.has(msg.cacheKey)) return;
    const bmp = renderToBitmap(msg);
    if (bmp) cachedBitmaps.set(msg.cacheKey, bmp);
    return;
  }
  if (msg.type !== 'render') return;
  const { id, cacheKey, scale, tx, ty, width, height, dpr } = msg;
  const cached = cacheKey ? cachedBitmaps.get(cacheKey) : null;
  if (cached) {
    cachedBitmaps.delete(cacheKey);
    self.postMessage({ id, scale, tx, ty, width, height, dpr, bitmap: cached }, [cached]);
    return;
  }
  const bitmap = renderToBitmap(msg);
  if (bitmap) self.postMessage({ id, scale, tx, ty, width, height, dpr, bitmap }, [bitmap]);
};
`;

type AtlasRoutesCanvasProps = {
  basisRef: RefObject<TransformBasis>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  center: Point;
  dark: boolean;
  height: number;
  hostRef: RefObject<HTMLElement | null>;
  liveBasisRef: RefObject<TransformBasis>;
  preRenderRef: RefObject<((center: Point, zoom: number, onReady?: () => void) => void) | null>;
  tones: ReadonlyArray<string>;
  visible: ReadonlySet<number> | null;
  visibleKey: string;
  width: number;
  workerRoutes: ReadonlyArray<WorkerRouteEntry>;
  zoom: number;
};

export function AtlasRoutesCanvas({
  basisRef,
  canvasRef,
  center,
  dark,
  height,
  hostRef,
  liveBasisRef,
  preRenderRef,
  tones,
  visible,
  visibleKey,
  width,
  workerRoutes,
  zoom,
}: AtlasRoutesCanvasProps) {
  const workerRef = useRef<Worker | null>(null);
  const reqIdRef = useRef(0);
  const sentRoutesRef = useRef<ReadonlyArray<WorkerRouteEntry> | null>(null);
  const lastRenderKeyRef = useRef('');
  const onReadyCallbacksRef = useRef(new Map<number, () => void>());
  const paletteCacheRef = useRef<{
    casingColor: string;
    dark: boolean;
    toneColors: Record<string, string>;
    tones: ReadonlyArray<string>;
  } | null>(null);

  useEffect(() => {
    if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return;
    const url = URL.createObjectURL(new Blob([WORKER_SCRIPT], { type: 'application/javascript' }));
    const worker = new Worker(url);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const { bitmap, dpr, height: bh, id, scale, tx, ty, width: bw } = event.data;
      const onReady = onReadyCallbacksRef.current.get(id);
      onReadyCallbacksRef.current.delete(id);
      const canvas = canvasRef.current;
      if (id < reqIdRef.current || !canvas) {
        bitmap?.close?.();
        return;
      }
      const pixelW = Math.max(1, Math.round(bw * dpr));
      const pixelH = Math.max(1, Math.round(bh * dpr));
      if (canvas.width !== pixelW || canvas.height !== pixelH) {
        canvas.width = pixelW;
        canvas.height = pixelH;
      }
      canvas.getContext('bitmaprenderer')?.transferFromImageBitmap(bitmap);
      const nextBasis = { scale, tx, ty };
      basisRef.current = nextBasis;
      applyRelativeTransform(canvas, liveBasisRef.current, nextBasis);
      const host = hostRef.current;
      if (host && host.dataset.canvasReady !== 'true') {
        host.dataset.canvasReady = 'true';
        for (const path of host.querySelectorAll('[data-atlas-overlay] path')) {
          path.setAttribute('d', '');
        }
      }
      onReady?.();
    };

    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
      workerRef.current = null;
      sentRoutesRef.current = null;
      lastRenderKeyRef.current = '';
    };
  }, [basisRef, canvasRef, hostRef, liveBasisRef]);

  const dispatchRender = (targetCenter: Point, targetZoom: number, onReady?: () => void) => {
    const worker = workerRef.current;
    const canvas = canvasRef.current;
    if (!worker || !canvas || width <= 0 || height <= 0) {
      onReady?.();
      return;
    }
    if (sentRoutesRef.current !== workerRoutes) {
      sentRoutesRef.current = workerRoutes;
      worker.postMessage({ routes: workerRoutes, type: 'routes' });
    }
    const basis = computeTransformBasis(targetCenter, targetZoom, width, height);
    const renderKey = `${visibleKey}|${dark ? 1 : 0}|${width}x${height}|${basis.tx.toFixed(2)},${basis.ty.toFixed(2)},${basis.scale.toFixed(6)}`;
    if (lastRenderKeyRef.current === renderKey) {
      applyRelativeTransform(canvas, liveBasisRef.current, basisRef.current);
      onReady?.();
      return;
    }
    lastRenderKeyRef.current = renderKey;

    if (
      !paletteCacheRef.current ||
      paletteCacheRef.current.dark !== dark ||
      paletteCacheRef.current.tones !== tones
    ) {
      const styles = getComputedStyle(canvas.closest('.collageRoot') ?? document.documentElement);
      const casingColor = resolveCssVarColor(styles, dark ? '--black' : '--cream', dark);
      const toneColors = Object.fromEntries(
        tones.map((tone) => [tone, resolveCssVarColor(styles, `--${tone}`, dark)]),
      );
      paletteCacheRef.current = { casingColor, dark, toneColors, tones };
    }
    const { casingColor, toneColors } = paletteCacheRef.current;
    const zoomFactor = Math.max(0, Math.min(1, (targetZoom - 4) / (15 - 4)));
    reqIdRef.current += 1;
    if (onReady) onReadyCallbacksRef.current.set(reqIdRef.current, onReady);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const baseMsg = {
      casingColor,
      casingWidth: 2 + zoomFactor * 5,
      dpr,
      height,
      lineWidth: 1 + zoomFactor * 2.5,
      scale: basis.scale,
      toneColors,
      tx: basis.tx,
      ty: basis.ty,
      width,
    };
    worker.postMessage({
      ...baseMsg,
      cacheKey: renderKey,
      id: reqIdRef.current,
      type: 'render',
      visibleIds: visible ? [...visible] : null,
    });
    if (visible !== null) {
      const allKey = `*|${dark ? 1 : 0}|${width}x${height}|${basis.tx.toFixed(2)},${basis.ty.toFixed(2)},${basis.scale.toFixed(6)}`;
      worker.postMessage({ ...baseMsg, cacheKey: allKey, type: 'prewarm', visibleIds: null });
    }
  };

  preRenderRef.current = dispatchRender;
  useEffect(() => {
    dispatchRender(center, zoom);
  });

  return <canvas data-atlas-canvas="" ref={canvasRef} />;
}
