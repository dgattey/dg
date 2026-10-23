import type { ReactNode } from 'react';
import { cx, paperToneVars } from '../../collage/paperVars';
import type { PaperTone } from '../../collage/types';

/** A die-cut scalloped circle as a percentage polygon, so it scales with its box. */
function scallopPolygon(bumps: number, depth: number): string {
  const samples = bumps * 10;
  const points = Array.from({ length: samples }, (_, i) => {
    const angle = (i / samples) * Math.PI * 2;
    const radius = 50 - depth + depth * Math.sqrt(Math.abs(Math.sin((bumps * angle) / 2)));
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return `${x.toFixed(2)}% ${y.toFixed(2)}%`;
  });
  return `polygon(${points.join(', ')})`;
}

const SCALLOPS = {
  seal: scallopPolygon(18, 3.2),
  sticker: scallopPolygon(12, 5),
} as const;

/** Paper cut in a scalloped round: totals seals and rank stickers. */
export function Scallop({
  children,
  className,
  size = 'seal',
  tiltDeg = 0,
  tone,
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof SCALLOPS;
  tiltDeg?: number;
  tone: PaperTone;
}) {
  return (
    <span className={cx('stats__cut', className)} style={paperToneVars(tone, tiltDeg)}>
      <span
        className={cx('stats__scallop', `stats__scallop--${size}`)}
        style={{ clipPath: SCALLOPS[size] }}
      >
        {children}
      </span>
    </span>
  );
}

/** Notched concert stub, or a postage stamp with perforated edges. */
export function Stub({
  children,
  className,
  kind,
  tiltDeg = 0,
  tone,
}: {
  children: ReactNode;
  className?: string;
  kind: 'stamp' | 'ticket';
  tiltDeg?: number;
  tone: PaperTone;
}) {
  return (
    <span className={cx('stats__cut', className)} style={paperToneVars(tone, tiltDeg)}>
      <span className={kind === 'ticket' ? 'stats__ticket' : 'stats__stamp'}>
        <span className="stats__face">{children}</span>
      </span>
    </span>
  );
}

const GROOVES = [92, 86, 80, 74, 68, 62, 56, 50, 44];

/** A record with grooves, a two-tone label, and the spindle hole. */
export function Vinyl({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={cx('stats__vinyl', className)} viewBox="0 0 200 200">
      <circle className="stats__vinylDisc" cx="100" cy="100" r="99" />
      {GROOVES.map((r) => (
        <circle className="stats__vinylGroove" cx="100" cy="100" key={r} r={r} />
      ))}
      <path className="stats__vinylSheen" d="M100 100 L38 22 A99 99 0 0 1 82 3 Z" />
      <path className="stats__vinylSheen" d="M100 100 L162 178 A99 99 0 0 1 118 197 Z" />
      <circle className="stats__vinylRing" cx="100" cy="100" r="36" />
      <circle className="stats__vinylLabel" cx="100" cy="100" r="29" />
      <circle className="stats__vinylHole" cx="100" cy="100" r="4" />
    </svg>
  );
}
