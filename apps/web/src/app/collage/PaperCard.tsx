import type { CSSProperties, ReactNode } from 'react';
import { cx, paperSurfaceVars } from './paperVars';
import type { PaperEdge, PaperTone } from './types';

export function PaperCard({
  children,
  className,
  edge = 'quad-a',
  innerClassName,
  style,
  tag,
  tiltDeg = 0,
  tone = 'cream',
}: {
  children?: ReactNode;
  className?: string;
  edge?: PaperEdge;
  innerClassName?: string;
  style?: CSSProperties;
  tag?: ReactNode;
  tiltDeg?: number;
  tone?: PaperTone;
}) {
  return (
    <div
      className={cx('paperWrap', className)}
      style={{ ...paperSurfaceVars(tone, edge, tiltDeg), ...style }}
    >
      <div className={cx('paperInner', innerClassName)}>{children}</div>
      {tag}
    </div>
  );
}
