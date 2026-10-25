import type { TypographyVariant } from '@dg/ui/core/Typography';
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
  variant?: TypographyVariant;
};

type PaperButtonProps = PaperButtonLook &
  (
    | {
        href: string;
        title: string;
        disabled?: undefined;
        expanded?: undefined;
        onClick?: () => void;
        type?: undefined;
      }
    | {
        href?: undefined;
        title?: undefined;
        disabled?: boolean;
        /** Whether the content this button shows and hides is showing. */
        expanded?: boolean;
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

export function PaperButton({
  children,
  className,
  current,
  disabled = false,
  edge = 'quad-c',
  expanded,
  href,
  onClick,
  tiltDeg = 0,
  title,
  tone = 'cream',
  type = 'button',
  variant = 'label',
}: PaperButtonProps) {
  const classNames = cx('paperButton', current && 'paperButtonCurrent', className);
  const ariaCurrent = current ? 'page' : undefined;

  return (
    <span className="paperWrap paperButtonWrap" style={paperSurfaceVars(tone, edge, tiltDeg)}>
      {href === undefined ? (
        <button
          aria-expanded={expanded}
          aria-pressed={current}
          className={classNames}
          data-typography={variant}
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
          variant={variant}
        >
          {children}
        </PageTransitionLink>
      ) : (
        <a
          aria-current={ariaCurrent}
          aria-label={title}
          className={classNames}
          data-typography={variant}
          href={href}
          onClick={onClick}
        >
          {children}
        </a>
      )}
    </span>
  );
}
