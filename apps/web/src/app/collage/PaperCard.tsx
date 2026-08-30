import type { CSSProperties, ReactNode } from 'react';
import type { PaperEdge, PaperTone } from './types';

type PaperCardProps = {
  children?: ReactNode;
  className?: string;
  edge?: PaperEdge;
  innerClassName?: string;
  tag?: ReactNode;
  tiltDeg?: number;
  tone?: PaperTone;
};

function cx(...parts: Array<string | undefined>): string {
  return parts.filter((part) => part !== undefined && part.length > 0).join(' ');
}

export function PaperCard({
  children,
  className,
  edge = 'quad-a',
  innerClassName,
  tag,
  tiltDeg = 0,
  tone = 'cream',
}: PaperCardProps) {
  return (
    <div
      className={cx('paperWrap', className)}
      data-tone={tone}
      style={{ '--r': `${tiltDeg}deg` } as CSSProperties}
    >
      <div className={cx('paperInner', innerClassName)} data-edge={edge}>
        {children}
        {tag}
      </div>
    </div>
  );
}
