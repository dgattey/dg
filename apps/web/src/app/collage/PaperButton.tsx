import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { shouldSkipRedesignRewrite } from '../../redesignRouting';
import { cx, paperEdgeVars, paperToneVars } from './paperVars';
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

/**
 * Route handlers and other origins aren't router pages: a client Link would
 * prefetch them, and their redirects to OAuth hosts fail as cross-origin fetches.
 */
function isAppPage(href: string): boolean {
  return (
    href.startsWith('/') &&
    !href.startsWith('//') &&
    !shouldSkipRedesignRewrite(href.split(/[?#]/)[0] ?? href)
  );
}

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
  const wrapStyle = paperToneVars(tone, tiltDeg);
  const surfaceStyle = paperEdgeVars(edge);

  if (href !== undefined && !isAppPage(href)) {
    return (
      <div className="paperWrap" style={wrapStyle}>
        <span style={surfaceStyle}>
          <a className={classNames} href={href} onClick={onClick} title={title}>
            {children}
          </a>
        </span>
      </div>
    );
  }

  if (href !== undefined) {
    return (
      <div className="paperWrap" style={wrapStyle}>
        <span style={surfaceStyle}>
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
      </div>
    );
  }

  return (
    <div className="paperWrap" style={wrapStyle}>
      <span style={surfaceStyle}>
        <button
          aria-pressed={current}
          className={classNames}
          disabled={disabled}
          onClick={onClick}
          type={type}
        >
          {children}
        </button>
      </span>
    </div>
  );
}
