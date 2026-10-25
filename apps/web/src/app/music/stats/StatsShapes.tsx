import type { TypographyVariant } from '@dg/ui/core/Typography';
import type { CSSProperties, ReactNode } from 'react';
import { type ScallopSize, scallopVertices } from '../../collage/cutOutShapes';
import { cx, paperToneVars } from '../../collage/paperVars';
import type { PaperTone } from '../../collage/types';

function scallopPolygon(size: ScallopSize): string {
  const points = scallopVertices(size, 50, 50).map(
    ({ x, y }) => `${x.toFixed(2)}% ${y.toFixed(2)}%`,
  );
  return `polygon(${points.join(', ')})`;
}

const SCALLOPS: Record<ScallopSize, string> = {
  seal: scallopPolygon('seal'),
  sticker: scallopPolygon('sticker'),
};

export type StubSize = 'default' | 'compact' | 'sm' | 'xs';

/** Paper cut in a scalloped round: totals seals and rank stickers. */
export function Scallop({
  'aria-hidden': ariaHidden,
  children,
  className,
  size = 'seal',
  tiltDeg = 0,
  tone,
  variant = size === 'sticker' ? 'label' : undefined,
}: {
  'aria-hidden'?: boolean;
  children: ReactNode;
  className?: string;
  size?: ScallopSize;
  tiltDeg?: number;
  tone: PaperTone;
  variant?: TypographyVariant;
}) {
  return (
    <span
      aria-hidden={ariaHidden}
      className={cx('stats__cut', className)}
      style={paperToneVars(tone, tiltDeg)}
    >
      <span
        className={cx('stats__scallop', `stats__scallop--${size}`)}
        data-typography={variant}
        style={{ '--scallop-clip': SCALLOPS[size] } as CSSProperties}
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
  size = 'default',
  tiltDeg = 0,
  tone,
}: {
  children: ReactNode;
  className?: string;
  kind: 'stamp' | 'ticket';
  size?: StubSize;
  tiltDeg?: number;
  tone: PaperTone;
}) {
  return (
    <span
      className={cx('stats__cut', className)}
      data-stub-size={size !== 'default' ? size : undefined}
      style={paperToneVars(tone, tiltDeg)}
    >
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
