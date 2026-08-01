'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { Link } from '../../dependent/Link';
import type { SxProps } from '../../theme';
import { rememberSheetOrigin } from './sheetScrollMemory';
import {
  SHEET_TITLE_SLOT_VIEW_TRANSITION_NAME,
  SHEET_TITLE_VIEW_TRANSITION_NAME,
  sheetTransitionTypes,
} from './sheetTransitions';

/**
 * The sheet's own heading owns the shared name while the sheet is open, so the
 * control holds the placeholder name then and the shared one the rest of the
 * time. Either way it stays out of the surrounding chrome's snapshot.
 */
function titleName(morphsTitle: boolean, isSheetOpen: boolean) {
  if (!morphsTitle) {
    return '';
  }
  return isSheetOpen ? SHEET_TITLE_SLOT_VIEW_TRANSITION_NAME : SHEET_TITLE_VIEW_TRANSITION_NAME;
}

export type SheetOpenLinkProps = {
  children?: ReactNode;
  color?: 'inherit';
  href: string;
  /**
   * Lends this control's box to the sheet heading. At most one control per
   * sheet may set it, since two elements sharing a `view-transition-name`
   * abort the transition.
   */
  morphsTitle?: boolean;
  sx?: SxProps;
  title: string;
  variant?: 'caption';
};

/**
 * Link that opens a sheet route, optionally handing its own box to the sheet
 * heading so the heading flies out of the control on the way in and back into
 * it on the way out.
 *
 * Swapping the name in a layout effect lands it before the browser photographs
 * either side of a navigation, which is what makes the return trip morph
 * rather than fade in place.
 */
export function SheetOpenLink({
  children,
  href,
  morphsTitle = false,
  sx,
  title,
  ...rest
}: SheetOpenLinkProps) {
  const anchor = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!anchor.current) {
      return;
    }
    anchor.current.style.viewTransitionName = titleName(morphsTitle, pathname === href);
  }, [href, morphsTitle, pathname]);

  return (
    <Link
      {...rest}
      href={href}
      onClick={() => {
        rememberSheetOrigin(pathname);
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
