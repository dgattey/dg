import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { cx, paperSurfaceVars } from './paperVars';
import type { PaperEdge, PaperTone } from './types';

type PaperButtonProps = {
  children: ReactNode;
  className?: string;
  current?: boolean;
  edge?: PaperEdge;
  tiltDeg?: number;
  tone?: PaperTone;
} & (
  | {
      href: string;
      title: string;
      disabled?: undefined;
      onClick?: () => void;
      type?: undefined;
    }
  | {
      href?: undefined;
      title?: undefined;
      disabled?: boolean;
      onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
      type?: 'button' | 'submit';
    }
);

export function PaperButton({
  children,
  className,
  current = false,
  disabled = false,
  edge = 'quad-c',
  href,
  onClick,
  tiltDeg = 0,
  title,
  tone = 'cream',
  type = 'button',
}: PaperButtonProps) {
  const classNames = cx('paperButton', current && 'paperButtonCurrent', className);
  const style: CSSProperties = paperSurfaceVars(tone, edge, tiltDeg);

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
      disabled={disabled}
      onClick={onClick}
      style={style}
      type={type}
    >
      {children}
    </button>
  );
}
