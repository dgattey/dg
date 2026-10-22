import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx, paperSurfaceVars } from './paperVars';
import type { PaperEdge, PaperTone } from './types';

type PaperButtonLook = {
  children: ReactNode;
  className?: string;
  current?: boolean;
  edge?: PaperEdge;
  tiltDeg?: number;
  tone?: PaperTone;
};

type PaperButtonProps = PaperButtonLook &
  (
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
  const pathname = href.split(/[?#]/)[0] ?? href;
  return (
    pathname.startsWith('/') &&
    !pathname.startsWith('//') &&
    pathname !== '/api' &&
    !pathname.startsWith('/api/')
  );
}

function PaperButtonWrap({
  children,
  edge = 'quad-c',
  tiltDeg = 0,
  tone = 'cream',
}: Pick<PaperButtonLook, 'children' | 'edge' | 'tiltDeg' | 'tone'>) {
  return (
    <span className="paperWrap paperButtonWrap" style={paperSurfaceVars(tone, edge, tiltDeg)}>
      {children}
    </span>
  );
}

function paperButtonClassName(current: boolean | undefined, className: string | undefined) {
  return cx('paperButton', current && 'paperButtonCurrent', className);
}

/** The paper button look on a plain span, for a control that owns its element, like `<summary>`. */
export function PaperButtonFace({ children, className, current, ...look }: PaperButtonLook) {
  return (
    <PaperButtonWrap {...look}>
      <span className={paperButtonClassName(current, className)}>{children}</span>
    </PaperButtonWrap>
  );
}

export function PaperButton({
  children,
  className,
  current,
  disabled = false,
  href,
  onClick,
  title,
  type = 'button',
  ...look
}: PaperButtonProps) {
  const classNames = paperButtonClassName(current, className);
  const ariaCurrent = current ? 'page' : undefined;

  return (
    <PaperButtonWrap {...look}>
      {href === undefined ? (
        <button
          aria-pressed={current}
          className={classNames}
          disabled={disabled}
          onClick={onClick}
          type={type}
        >
          {children}
        </button>
      ) : isAppPage(href) ? (
        <PageTransitionLink
          aria-current={ariaCurrent}
          className={classNames}
          href={href}
          onClick={onClick}
          title={title}
        >
          {children}
        </PageTransitionLink>
      ) : (
        <a
          aria-current={ariaCurrent}
          aria-label={title}
          className={classNames}
          href={href}
          onClick={onClick}
        >
          {children}
        </a>
      )}
    </PaperButtonWrap>
  );
}
