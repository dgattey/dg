import type { CSSProperties, ReactNode } from 'react';
import styles from './paper.module.css';
import { EDGE_CLASS, TONE_CLASS } from './paperClasses';
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
      className={cx(styles.wrap, TONE_CLASS[tone], className)}
      style={{ '--r': `${tiltDeg}deg` } as CSSProperties}
    >
      <div className={cx(styles.inner, EDGE_CLASS[edge], innerClassName)}>
        {children}
        {tag}
      </div>
    </div>
  );
}
