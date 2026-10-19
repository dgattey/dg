'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Link } from '../../dependent/Link';
import type { SxProps } from '../../theme';
import { rememberPageOrigin } from './pageScrollMemory';
import { pageTransitionTypes } from './pageTransitions';

export type PageTransitionLinkProps = {
  children?: ReactNode;
  className?: string;
  color?: 'inherit';
  href: string;
  'aria-current'?: 'page';
  onClick?: () => void;
  role?: React.AriaRole;
  sx?: SxProps;
  title: string;
  variant?: 'caption';
};

export function PageTransitionLink({
  children,
  href,
  onClick,
  sx,
  title,
  ...rest
}: PageTransitionLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      {...rest}
      href={href}
      onClick={() => {
        rememberPageOrigin(pathname);
        onClick?.();
      }}
      sx={sx}
      title={title}
      transitionTypes={pageTransitionTypes('open')}
    >
      {children}
    </Link>
  );
}
