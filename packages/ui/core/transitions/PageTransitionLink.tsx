'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';
import { rememberPageOrigin } from './pageScrollMemory';
import { pageTransitionTypes } from './pageTransitions';

type PageTransitionLinkProps = {
  'aria-current'?: 'page';
  children?: ReactNode;
  className?: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  title: string;
};

/**
 * A bare anchor, so the caller's class owns every type and color rule. Routing it
 * through `Typography` stamped the system sans and body size over paper buttons.
 */
export function PageTransitionLink({
  children,
  href,
  onClick,
  title,
  ...rest
}: PageTransitionLinkProps) {
  const pathname = usePathname();

  return (
    <NextLink
      {...rest}
      aria-label={title}
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
