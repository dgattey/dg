'use client';

import type { Point } from 'pigeon-maps';
import { type RefObject, useEffect, useRef } from 'react';
import {
  applyRelativeTransform,
  computeTransformBasis,
  type TransformBasis,
  unprojectMercatorRef,
} from './AtlasRoutesCanvas';
import { MERCATOR_REF_ZOOM, mercatorRefPoint } from './routeFrame';

const MIN_ZOOM = 3;
const MAX_ZOOM = 18;
const WHEEL_PIXELS_PER_ZOOM = 150;
const WHEEL_SETTLE_MS = 140;
const BUTTON_ANIM_MS = 150;

type UseAtlasGesturesParams = {
  activeCenter: Point;
  activeZoom: number;
  basisRef: RefObject<TransformBasis>;
  boundsKey: string;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  defaultCenter: Point;
  defaultZoom: number;
  height: number;
  liveBasisRef: RefObject<TransformBasis>;
  onCenterChange?: (center: Point) => void;
  onCommitViewport: (next: { boundsKey: string; center: Point; zoom: number } | null) => void;
  preRenderRef: RefObject<((center: Point, zoom: number, onReady?: () => void) => void) | null>;
  tilesRef: RefObject<HTMLDivElement | null>;
  width: number;
};

export function useAtlasGestures({
  activeCenter,
  activeZoom,
  basisRef,
  boundsKey,
  canvasRef,
  defaultCenter,
  defaultZoom,
  height,
  liveBasisRef,
  onCenterChange,
  onCommitViewport,
  preRenderRef,
  tilesRef,
  width,
}: UseAtlasGesturesParams) {
  const gestureRef = useRef({
    animFrame: null as number | null,
    boundsKey,
    cachedRect: null as DOMRect | null,
    defaultCenter,
    defaultZoom,
    dragging: false,
    dragStartCenterRef: { x: 0, y: 0 },
    dragStartX: 0,
    dragStartY: 0,
    height,
    liveCenter: activeCenter,
    liveRef: mercatorRefPoint(activeCenter),
    liveZoom: activeZoom,
    onCenterChange,
    onCommitViewport,
    settledCenter: activeCenter,
    settledZoom: activeZoom,
    targetCenter: activeCenter,
    targetZoom: activeZoom,
    wheelTimer: null as ReturnType<typeof setTimeout> | null,
    width,
  });

  const g = gestureRef.current;
  g.boundsKey = boundsKey;
  g.defaultCenter = defaultCenter;
  g.defaultZoom = defaultZoom;
  g.width = width;
  g.height = height;
  g.onCenterChange = onCenterChange;
  g.onCommitViewport = onCommitViewport;
  if (!g.dragging && g.animFrame === null && g.wheelTimer === null) {
    g.settledCenter = activeCenter;
    g.settledZoom = activeZoom;
    g.liveCenter = activeCenter;
    g.liveRef = mercatorRefPoint(activeCenter);
    g.liveZoom = activeZoom;
    g.targetCenter = activeCenter;
    g.targetZoom = activeZoom;
  }

  useEffect(() => {
    if (tilesRef.current) {
      tilesRef.current.style.transform = '';
    }
    const settled = computeTransformBasis(activeCenter, activeZoom, width, height);
    liveBasisRef.current = settled;
    applyRelativeTransform(canvasRef.current, settled, basisRef.current);
  }, [activeCenter, activeZoom, basisRef, canvasRef, height, liveBasisRef, tilesRef, width]);

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
    const prevBasis = computeTransformBasis(g.settledCenter, g.settledZoom, g.width, g.height);
    const nextBasis = computeTransformBasis(nextCenter, nextZoom, g.width, g.height);
    g.liveCenter = nextCenter;
    g.liveRef = mercatorRefPoint(nextCenter);
    g.liveZoom = nextZoom;
    g.targetCenter = nextCenter;
    g.targetZoom = nextZoom;
    if (tilesRef.current) {
      tilesRef.current.style.transform = '';
    }
    liveBasisRef.current = nextBasis;
    applyRelativeTransform(canvasRef.current, nextBasis, basisRef.current);
    if (
      !isReset &&
      Math.abs(nextBasis.scale - prevBasis.scale) < 1e-5 &&
      Math.abs(nextBasis.tx - prevBasis.tx) < 0.25 &&
      Math.abs(nextBasis.ty - prevBasis.ty) < 0.25
    ) {
      return;
    }
    g.settledCenter = nextCenter;
    g.settledZoom = nextZoom;
    if (isReset) {
      g.onCommitViewport(null);
    } else {
      g.onCommitViewport({ boundsKey: g.boundsKey, center: nextCenter, zoom: nextZoom });
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
      const cursorRefX = st.liveRef.x + (px - st.width / 2) / prevScale;
      const cursorRefY = st.liveRef.y + (py - st.height / 2) / prevScale;
      const nextRef = {
        x: cursorRefX - (px - st.width / 2) / nextScale,
        y: cursorRefY - (py - st.height / 2) / nextScale,
      };
      st.liveRef = nextRef;
      const nextCenter = unprojectMercatorRef(nextRef);
      st.targetCenter = nextCenter;
      st.targetZoom = nextZoom;
      syncGestureTransform(nextCenter, nextZoom);
      if (st.wheelTimer !== null) {
        clearTimeout(st.wheelTimer);
      }
      st.wheelTimer = setTimeout(() => {
        st.wheelTimer = null;
        st.cachedRect = null;
        const settleCenter = st.liveCenter;
        const settleZoom = st.liveZoom;
        if (preRenderRef.current) {
          preRenderRef.current(settleCenter, settleZoom, () => {
            if (!st.dragging && st.wheelTimer === null && st.animFrame === null) {
              commitGesture(settleCenter, settleZoom, false);
            }
          });
        } else {
          commitGesture(settleCenter, settleZoom, false);
        }
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
      const nextRef = {
        x: st.dragStartCenterRef.x - (event.clientX - st.dragStartX) / scale,
        y: st.dragStartCenterRef.y - (event.clientY - st.dragStartY) / scale,
      };
      st.liveRef = nextRef;
      const nextCenter = unprojectMercatorRef(nextRef);
      st.targetCenter = nextCenter;
      syncGestureTransform(nextCenter, st.liveZoom);
    };

    const handleMouseUp = () => {
      if (!st.dragging) return;
      st.dragging = false;
      const settleCenter = st.liveCenter;
      const settleZoom = st.liveZoom;
      if (preRenderRef.current) {
        preRenderRef.current(settleCenter, settleZoom, () => {
          if (!st.dragging && st.wheelTimer === null && st.animFrame === null) {
            commitGesture(settleCenter, settleZoom, false);
          }
        });
      } else {
        commitGesture(settleCenter, settleZoom, false);
      }
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

    let animDone = false;
    let bitmapReady = !preRenderRef.current;
    const finishIfReady = () => {
      if (animDone && bitmapReady && !g.dragging && g.wheelTimer === null && g.animFrame === null) {
        commitGesture(targetCenter, targetZoom, isReset);
      }
    };
    preRenderRef.current?.(targetCenter, targetZoom, () => {
      bitmapReady = true;
      finishIfReady();
    });

    const startRef = mercatorRefPoint(g.liveCenter);
    const endRef = mercatorRefPoint(targetCenter);
    const startZoom = g.liveZoom;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - startTime) / BUTTON_ANIM_MS));
      const eased = t * (2 - t);
      if (t >= 1) {
        g.animFrame = null;
        g.liveRef = endRef;
        syncGestureTransform(targetCenter, targetZoom);
        animDone = true;
        finishIfReady();
        return;
      }
      const nextRef = {
        x: startRef.x + (endRef.x - startRef.x) * eased,
        y: startRef.y + (endRef.y - startRef.y) * eased,
      };
      g.liveRef = nextRef;
      syncGestureTransform(
        unprojectMercatorRef(nextRef),
        startZoom + (targetZoom - startZoom) * eased,
      );
      g.animFrame = requestAnimationFrame(step);
    };
    g.animFrame = requestAnimationFrame(step);
  };

  return {
    onReset: () => animateButtonZoom(defaultCenter, defaultZoom, true),
    onZoomIn: () => animateButtonZoom(g.targetCenter, Math.min(MAX_ZOOM, g.targetZoom + 1), false),
    onZoomOut: () => animateButtonZoom(g.targetCenter, Math.max(MIN_ZOOM, g.targetZoom - 1), false),
  };
}
