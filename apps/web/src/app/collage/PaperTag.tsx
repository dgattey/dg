import type { CSSProperties, ReactNode } from 'react';
import type { PaperEdge, PaperTone } from './types';

type PaperTagProps = {
  children: ReactNode;
  className?: string;
  edge?: PaperEdge;
  tiltDeg?: number;
  tone?: PaperTone;
};

export function PaperTag({
  children,
  className,
  edge = 'quad-c',
  tiltDeg = 0,
  tone = 'cream',
}: PaperTagProps) {
  return (
    <span
      className={['paperTag', className].filter((part) => part !== undefined && part.length > 0).join(' ')}
      data-edge={edge}
      data-tone={tone}
      style={{ '--r': `${tiltDeg}deg` } as CSSProperties}
    >
      {children}
    </span>
  );
}
