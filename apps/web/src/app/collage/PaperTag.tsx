import type { TypographyVariant } from '@dg/ui/core/Typography';
import type { CSSProperties, ReactNode } from 'react';
import { cx, paperSurfaceVars } from './paperVars';
import type { PaperEdge, PaperTone } from './types';

export function PaperTag({
  children,
  className,
  'data-typography-sm': dataTypographySm,
  edge = 'quad-c',
  style,
  tiltDeg = 0,
  tone = 'cream',
  variant = 'label',
}: {
  children: ReactNode;
  className?: string;
  'data-typography-sm'?: TypographyVariant;
  edge?: PaperEdge;
  style?: CSSProperties;
  tiltDeg?: number;
  tone?: PaperTone;
  variant?: TypographyVariant;
}) {
  return (
    <span
      className={cx('paperTag', className)}
      data-typography={variant}
      data-typography-sm={dataTypographySm}
      style={{ ...paperSurfaceVars(tone, edge, tiltDeg), ...style }}
    >
      {children}
    </span>
  );
}
