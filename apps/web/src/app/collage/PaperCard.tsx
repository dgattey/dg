import type { CSSProperties, ReactNode } from 'react';
import { cx, paperEdgeVars, paperToneVars } from './paperVars';
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
      style={{ ...paperToneVars(tone, tiltDeg), ...style }}
    >
      <div className={cx('paperInner', innerClassName)} style={paperEdgeVars(edge)}>
        {children}
        {tag}
      </div>
    </div>
  );
}
