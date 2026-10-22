'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { rememberPageOrigin } from './pageScrollMemory';
import { pageTransitionTypes } from './pageTransitions';

export type PageTransitionLinkProps = {
  'aria-current'?: 'page';
  children?: ReactNode;
  className?: string;
  href: string;
  onClick?: () => void;
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
      onClick={() => {
        rememberPageOrigin(pathname);
        onClick?.();
      }}
      transitionTypes={pageTransitionTypes('open')}
    >
      {children}
    </NextLink>
  );
}
