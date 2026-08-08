export function getConcentricBorderRadius(parentRadiusPx: number, insetPx: number): string {
  const radiusPx = Math.max(0, parentRadiusPx - Math.max(0, insetPx));
  return `${radiusPx}px`;
}
