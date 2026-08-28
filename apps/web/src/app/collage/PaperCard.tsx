import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { CSSProperties, ReactNode } from 'react';
import styles from './paper.module.css';
import { EDGE_CLASS, TONE_CLASS } from './paperClasses';
import type { PaperEdge, PaperTone } from './types';

type PaperCardBase = {
  children?: ReactNode;
  className?: string;
  edge?: PaperEdge;
  innerClassName?: string;
  tag?: ReactNode;
  tiltDeg?: number;
  tone?: PaperTone;
};

type PaperCardProps = PaperCardBase &
  ({ href: string; title: string } | { href?: undefined; title?: undefined });

function cx(...parts: Array<string | undefined>): string {
  return parts.filter((part) => part !== undefined && part.length > 0).join(' ');
}

export function PaperCard({
  children,
  className,
  edge = 'quad-a',
  href,
  innerClassName,
  tag,
  tiltDeg = 0,
  title,
  tone = 'cream',
}: PaperCardProps) {
  const inner = (
    <div className={cx(styles.inner, EDGE_CLASS[edge], innerClassName)}>
      {children}
      {tag}
    </div>
  );

  return (
    <div
      className={cx(styles.wrap, TONE_CLASS[tone], className)}
      style={{ '--r': `${tiltDeg}deg` } as CSSProperties}
    >
      {href === undefined ? (
        inner
      ) : (
        <PageTransitionLink className={styles.link} href={href} title={title}>
          {inner}
        </PageTransitionLink>
      )}
    </div>
  );
}
