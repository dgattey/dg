/**
 * Draws the Big map's route-frequency heatmap off the main thread and posts it
 * back as an ImageBitmap tagged with the basis it was drawn in.
 */
export const WORKER_SCRIPT = `let allRoutes = [], offscreen = null, ctx = null;
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
