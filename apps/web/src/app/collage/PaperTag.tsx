import type { CSSProperties, ReactNode } from 'react';
import { cx, paperSurfaceVars } from './paperVars';
import type { PaperEdge, PaperTone } from './types';

export function PaperTag({
  children,
  className,
  edge = 'quad-c',
  style,
  tiltDeg = 0,
  tone = 'cream',
}: {
  children: ReactNode;
  className?: string;
  edge?: PaperEdge;
  style?: CSSProperties;
  tiltDeg?: number;
  tone?: PaperTone;
}) {
  return (
    <span
      className={cx('paperTag', className)}
      style={{ ...paperSurfaceVars(tone, edge, tiltDeg), ...style }}
    >
      {children}
    </span>
  );
}
