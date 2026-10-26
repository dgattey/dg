'use client';

import type { Point } from 'pigeon-maps';
import { type RefObject, useEffect, useRef } from 'react';
import { type FramedPath, MERCATOR_REF_ZOOM, mercatorRefPoint } from './routeFrame';

const MERCATOR_REF_SCALE = 256 * 2 ** MERCATOR_REF_ZOOM;

export type TransformBasis = {
  scale: number;
  tx: number;
  ty: number;
};

export function computeTransformBasis(
  center: Point,
  zoom: number,
  width: number,
  height: number,
): TransformBasis {
  const centerRef = mercatorRefPoint(center);
  const scale = 2 ** (zoom - MERCATOR_REF_ZOOM);
  return {
    scale,
    tx: width / 2 - centerRef.x * scale,
    ty: height / 2 - centerRef.y * scale,
  };
}

export function applyRelativeTransform(
  element: HTMLElement | null,
  live: TransformBasis,
  base: TransformBasis,
) {
  if (!element) {
    return;
  }
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
  const longitude = nx * 360 - 180;
  const latitudeRadians = Math.atan(Math.sinh(Math.PI * (1 - 2 * ny)));
  return [(latitudeRadians * 180) / Math.PI, longitude];
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
let cachedPathsKey = '';
let parsedPaths = [];
let offscreen = null;
let ctx = null;

function parsePathChunks(d) {
  const chunks = [];
  const parts = d.split(/(?=M)/);
  for (let p = 0; p < parts.length; p++) {
    const part = parts[p];
    if (!part) continue;
    const nums = part.slice(1).trim().split(/[l\\s]+/).map(Number);
    if (nums.length < 4) continue;
    let x = nums[0], y = nums[1];
    let minX = x, maxX = x, minY = y, maxY = y;
    const coords = new Int32Array(nums.length);
    coords[0] = x; coords[1] = y;
    for (let i = 2; i < nums.length; i += 2) {
      x += nums[i]; y += nums[i + 1];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      coords[i] = x; coords[i + 1] = y;
    }
    chunks.push({ minX, maxX, minY, maxY, coords });
  }
  return chunks;
}

self.onmessage = (event) => {
  const msg = event.data;
  if (msg.type === 'paths') {
    if (msg.pathsKey !== cachedPathsKey) {
      cachedPathsKey = msg.pathsKey;
      parsedPaths = msg.paths.map((item) => ({ tone: item.tone, chunks: parsePathChunks(item.d) }));
    }
    return;
  }
  if (msg.type !== 'render') return;

  const { id, width, height, dpr, scale, tx, ty, casingColor, casingWidth, lineWidth, toneColors } = msg;
  const pixelW = Math.max(1, Math.round(width * dpr));
  const pixelH = Math.max(1, Math.round(height * dpr));
  if (!offscreen || offscreen.width !== pixelW || offscreen.height !== pixelH) {
    offscreen = new OffscreenCanvas(pixelW, pixelH);
    ctx = offscreen.getContext('2d');
  }
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const margin = 16;
  const vMinX = (-tx - margin) / scale, vMaxX = (width - tx + margin) / scale;
  const vMinY = (-ty - margin) / scale, vMaxY = (height - ty + margin) / scale;

  const built = [];
  for (let i = 0; i < parsedPaths.length; i++) {
    const entry = parsedPaths[i];
    const p2 = new Path2D();
    const seen = new Set();
    const chunks = entry.chunks;
    let hasSegments = false;
    for (let c = 0; c < chunks.length; c++) {
      const chunk = chunks[c];
      if (chunk.maxX < vMinX || chunk.minX > vMaxX || chunk.maxY < vMinY || chunk.minY > vMaxY) continue;
      const coords = chunk.coords;
      let prevX = -999999, prevY = -999999, started = false;
      for (let j = 0; j < coords.length; j += 2) {
        const sx = Math.round(coords[j] * scale + tx);
        const sy = Math.round(coords[j + 1] * scale + ty);
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
          hasSegments = true;
        }
        prevX = sx; prevY = sy;
      }
    }
    if (hasSegments) built.push({ color: toneColors[entry.tone] || '#2c4db0', p2 });
  }

  if (built.length > 0) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = casingColor;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = casingWidth;
    for (let i = 0; i < built.length; i++) ctx.stroke(built[i].p2);
    ctx.globalAlpha = 1;
    ctx.lineWidth = lineWidth;
    for (let i = 0; i < built.length; i++) {
      ctx.strokeStyle = built[i].color;
      ctx.stroke(built[i].p2);
    }
  }

  const bitmap = offscreen.transferToImageBitmap();
  self.postMessage({ id, scale, tx, ty, width, height, dpr, bitmap }, [bitmap]);
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
  paths: ReadonlyArray<FramedPath>;
  pathsKey: string;
  preRenderRef: RefObject<((center: Point, zoom: number) => void) | null>;
  width: number;
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
  paths,
  pathsKey,
  preRenderRef,
  width,
  zoom,
}: AtlasRoutesCanvasProps) {
  const workerRef = useRef<Worker | null>(null);
  const reqIdRef = useRef(0);
  const sentPathsKeyRef = useRef('');
  const lastRenderKeyRef = useRef('');

  useEffect(() => {
    if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') {
      return;
    }
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent) => {
      const { bitmap, dpr, height: bh, id, scale, tx, ty, width: bw } = event.data;
      if (id < reqIdRef.current) {
        bitmap?.close?.();
        return;
      }
      const canvas = canvasRef.current;
      if (!canvas) {
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
      if (hostRef.current && hostRef.current.dataset.canvasReady !== 'true') {
        hostRef.current.dataset.canvasReady = 'true';
      }
    };

    return () => {
      worker.terminate();
      URL.revokeObjectURL(url);
      workerRef.current = null;
      sentPathsKeyRef.current = '';
      lastRenderKeyRef.current = '';
    };
  }, [basisRef, canvasRef, hostRef, liveBasisRef]);

  const dispatchRender = (targetCenter: Point, targetZoom: number) => {
    const worker = workerRef.current;
    const canvas = canvasRef.current;
    if (!worker || !canvas || width <= 0 || height <= 0) {
      return;
    }
    if (sentPathsKeyRef.current !== pathsKey) {
      sentPathsKeyRef.current = pathsKey;
      worker.postMessage({ paths, pathsKey, type: 'paths' });
    }
    const basis = computeTransformBasis(targetCenter, targetZoom, width, height);
    const renderKey = `${pathsKey}|${dark ? 1 : 0}|${width}x${height}|${basis.tx.toFixed(2)},${basis.ty.toFixed(2)},${basis.scale.toFixed(6)}`;
    if (lastRenderKeyRef.current === renderKey) {
      applyRelativeTransform(canvas, liveBasisRef.current, basisRef.current);
      return;
    }
    lastRenderKeyRef.current = renderKey;

    const root = canvas.closest('.collageRoot') ?? document.documentElement;
    const styles = getComputedStyle(root);
    const casingColor = resolveCssVarColor(styles, dark ? '--black' : '--cream', dark);
    const toneColors: Record<string, string> = {};
    for (const { tone } of paths) {
      toneColors[tone] = resolveCssVarColor(styles, `--${tone}`, dark);
    }

    const zoomFactor = Math.max(0, Math.min(1, (targetZoom - 4) / (15 - 4)));
    const casingWidth = 2 + zoomFactor * 5;
    const lineWidth = 1 + zoomFactor * 2.5;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    reqIdRef.current += 1;
    worker.postMessage({
      casingColor,
      casingWidth,
      dpr,
      height,
      id: reqIdRef.current,
      lineWidth,
      scale: basis.scale,
      toneColors,
      tx: basis.tx,
      ty: basis.ty,
      type: 'render',
      width,
    });
  };

  preRenderRef.current = dispatchRender;

  useEffect(() => {
    dispatchRender(center, zoom);
  });

  return <canvas data-atlas-canvas="" ref={canvasRef} />;
}
