import type { Point } from 'pigeon-maps';
import { project, unproject } from './routeGeometry';

export const REF_ZOOM = 12;
const REF_SCALE = 256 * 2 ** REF_ZOOM;
/** The Big map draws in a fixed 780x940 frame and scales it to the card. */
export const ATLAS_W = 780;
export const ATLAS_H = 940;

export type Basis = { scale: number; tx: number; ty: number };
export type RefViewport = { x: number; y: number; zoom: number };

export const refOf = (pt: Point) => ({
  x: project(pt).x * REF_SCALE,
  y: project(pt).y * REF_SCALE,
});

export const toLatLng = ({ x, y }: { x: number; y: number }): Point =>
  unproject({
    x: Math.max(0, Math.min(1, x / REF_SCALE)),
    y: Math.max(0.05, Math.min(0.95, y / REF_SCALE)),
  });

export const basisOf = (v: RefViewport): Basis => {
  const scale = 2 ** (v.zoom - REF_ZOOM);
  return { scale, tx: ATLAS_W / 2 - v.x * scale, ty: ATLAS_H / 2 - v.y * scale };
};

/** Moves an element drawn at `base` to show `live`, scaled from the frame to its rendered size. */
export const applyTransform = (
  el: HTMLElement | null,
  live: Basis,
  base: Basis,
  cw = ATLAS_W,
  ch = ATLAS_H,
) => {
  if (!el) return;
  const s = live.scale / base.scale;
  const tx = (live.tx - base.tx * s) * (cw / ATLAS_W);
  const ty = (live.ty - base.ty * s) * (ch / ATLAS_H);
  el.style.transform =
    Math.abs(s - 1) < 1e-5 && Math.abs(tx) < 0.05 && Math.abs(ty) < 0.05
      ? ''
      : `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0px) scale(${s.toFixed(5)})`;
};
