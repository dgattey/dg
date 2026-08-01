'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { Link } from '../../dependent/Link';
import type { SxProps } from '../../theme';
import { rememberSheetOrigin } from './sheetScrollMemory';
import { SHEET_TITLE_VIEW_TRANSITION_NAME, sheetTransitionTypes } from './sheetTransitions';

export type SheetOpenLinkProps = {
  children?: ReactNode;
  color?: 'inherit';
  href: string;
  sx?: SxProps;
  title: string;
  variant?: 'caption';
};

/**
 * Link that hands its own box to the sheet heading as the view transition
 * starts, so the heading flies out of the control that was clicked.
 *
 * The name lands on the anchor at click time rather than at render time
 * because several controls can open the same sheet, and two elements sharing
 * a `view-transition-name` abort the transition outright. It is dropped again
 * once the new route commits, otherwise the sheet's own heading would collide
 * with it on the way back out.
 */
export function SheetOpenLink({ children, href, sx, title, ...rest }: SheetOpenLinkProps) {
  const anchor = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (pathname === href && anchor.current) {
      anchor.current.style.viewTransitionName = '';
    }
  }, [href, pathname]);

  return (
    <Link
      {...rest}
      href={href}
      onClick={() => {
        rememberSheetOrigin(pathname);
        if (anchor.current) {
          anchor.current.style.viewTransitionName = SHEET_TITLE_VIEW_TRANSITION_NAME;
        }
      }}
      ref={anchor}
      sx={sx}
      title={title}
      transitionTypes={sheetTransitionTypes('open')}
    >
      {children}
    </Link>
  );
}
