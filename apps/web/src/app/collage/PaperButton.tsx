import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import styles from './paper.module.css';
import { EDGE_CLASS, TONE_CLASS } from './paperClasses';
import type { PaperEdge, PaperTone } from './types';

type PaperButtonBase = {
  children: ReactNode;
  className?: string;
  current?: boolean;
  edge?: PaperEdge;
  tiltDeg?: number;
  tone?: PaperTone;
};

type PaperButtonProps = PaperButtonBase &
  (
    | {
        href: string;
        title: string;
        onClick?: () => void;
        type?: undefined;
      }
    | {
        href?: undefined;
        title?: undefined;
        onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
        type?: 'button' | 'submit';
      }
  );

export function PaperButton({
  children,
  className,
  current = false,
  edge = 'quad-c',
  href,
  onClick,
  tiltDeg = 0,
  title,
  tone = 'cream',
  type = 'button',
}: PaperButtonProps) {
  const classNames = [
    styles.button,
    TONE_CLASS[tone],
    EDGE_CLASS[edge],
    current ? styles.buttonCurrent : undefined,
    className,
  ]
    .filter((part) => part !== undefined && part.length > 0)
    .join(' ');
  const style = { '--r': `${tiltDeg}deg` } as CSSProperties;

  if (href !== undefined) {
    return (
      <span style={style}>
        <PageTransitionLink
          aria-current={current ? 'page' : undefined}
          className={classNames}
          href={href}
          onClick={onClick}
          title={title}
        >
          {children}
        </PageTransitionLink>
      </span>
    );
  }

  return (
    <button
      aria-pressed={current}
      className={classNames}
      onClick={onClick}
      style={style}
      type={type}
    >
      {children}
    </button>
  );
}
