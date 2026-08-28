'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { Link } from '../../dependent/Link';
import type { SxProps } from '../../theme';
import { rememberPageOrigin } from './pageScrollMemory';
import { pageTitleMorphName, pageTransitionTypes } from './pageTransitions';

export type PageTransitionLinkProps = {
  children?: ReactNode;
  className?: string;
  color?: 'inherit';
  href: string;
  'aria-current'?: 'page';
  /**
   * Lends this control's box to the destination's heading. At most one control
   * per destination may set it, since two elements sharing a
   * `view-transition-name` abort the transition.
   */
  morphsTitle?: boolean;
  onClick?: () => void;
  role?: React.AriaRole;
  sx?: SxProps;
  title: string;
  variant?: 'caption';
};

/**
 * Link that rises a destination page over the current one, optionally handing
 * its own box to that page's heading so the heading flies out of the control on
 * the way in and back into it on the way out.
 *
 * Swapping the name in a layout effect lands it before the browser photographs
 * either side of a navigation, which is what makes the return trip morph
 * rather than fade in place.
 */
export function PageTransitionLink({
  children,
  href,
  morphsTitle = false,
  onClick,
  sx,
  title,
  ...rest
}: PageTransitionLinkProps) {
  const anchor = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!anchor.current) {
      return;
    }
    anchor.current.style.viewTransitionName = morphsTitle
      ? pageTitleMorphName(pathname === href)
      : '';
  }, [href, morphsTitle, pathname]);

  return (
    <Link
      {...rest}
      href={href}
      onClick={() => {
        rememberPageOrigin(pathname);
        onClick?.();
      }}
      ref={anchor}
      sx={sx}
      title={title}
      transitionTypes={pageTransitionTypes('open')}
    >
      {children}
    </Link>
  );
}
