'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { FocusEvent, MouseEvent, PointerEvent, ReactNode } from 'react';
import type { TypographyVariant } from '../Typography';
import { rememberPageOrigin } from './pageScrollMemory';
import { pageTransitionTypes } from './pageTransitions';

type PageTransitionLinkProps = {
  'aria-current'?: 'page';
  children?: ReactNode;
  className?: string;
  'data-typography-xs'?: TypographyVariant;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** With `onPointerEnter`, lets the destination start loading its own data before the press. */
  onFocus?: (event: FocusEvent<HTMLAnchorElement>) => void;
  onPointerEnter?: (event: PointerEvent<HTMLAnchorElement>) => void;
  title: string;
  variant?: TypographyVariant;
};

/**
 * A bare anchor that optionally carries a `data-typography` role when `variant` is set.
 */
export function PageTransitionLink({
  children,
  href,
  onClick,
  title,
  variant,
  ...rest
}: PageTransitionLinkProps) {
  const pathname = usePathname();

  return (
    <NextLink
      {...rest}
      aria-label={title}
      data-typography={variant}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          rememberPageOrigin(pathname);
        }
      }}
      transitionTypes={pageTransitionTypes('open')}
    >
      {children}
    </NextLink>
  );
}
