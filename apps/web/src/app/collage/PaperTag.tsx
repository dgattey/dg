import type { CSSProperties, ReactNode } from 'react';
import styles from './paper.module.css';
import { EDGE_CLASS, TONE_CLASS } from './paperClasses';
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
      className={[styles.tag, TONE_CLASS[tone], EDGE_CLASS[edge], className]
        .filter((part) => part !== undefined && part.length > 0)
        .join(' ')}
      style={{ '--r': `${tiltDeg}deg` } as CSSProperties}
    >
      {children}
    </span>
  );
}
