import NextLink from 'next/link';
import React from 'react';
import { Box } from '../core/Box';
import { Typography, type TypographyVariant } from '../core/Typography';
import type { SxObject, SxProps } from '../theme';

type LinkProps = {
  children?: React.ReactNode;
  className?: string;
  href: string | undefined;
  isExternal?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  sx?: SxProps;
  title?: string;
  transitionTypes?: ReadonlyArray<string>;
  variant?: TypographyVariant;
};

const baseLinkSx: SxObject = {
  '&:hover': {
    textDecoration: 'underline',
  },
  color: 'inherit',
  cursor: 'pointer',
  textDecoration: 'none',
};

/**
 * Official Cursor cube mark (simple-icons / cursor brand), sized like FaIcon
 * peers so footer icons share caption color via currentColor.
 */
export function CursorIcon({ size = '1em' }: { size?: string }) {
  return (
    // sx rather than an inline style, so surfaces that size icon spans in CSS still can
    <Box
      aria-hidden
      component="span"
      sx={{
        display: 'inline-flex',
        height: size,
        width: size,
      }}
    >
      <svg aria-hidden="true" fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
        <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
      </svg>
    </Box>
  );
}

/**
 * Server-compatible Link component with Next.js navigation and theme styling.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, className, href, isExternal, onClick, sx, title, transitionTypes, variant = 'body1' },
  ref,
) {
  if (!href) {
    return null;
  }

  const contents = children ?? title;
  const mergedLinkSx: SxProps = Array.isArray(sx)
    ? [baseLinkSx, ...sx]
    : sx
      ? [baseLinkSx, sx]
      : baseLinkSx;
  const anchorProps = {
    'aria-label': title,
    onClick,
    ref,
  };

  if (isExternal) {
    return (
      <Typography
        {...anchorProps}
        className={className}
        component="a"
        href={href}
        rel="noreferrer"
        sx={mergedLinkSx}
        target="_blank"
        variant={variant}
      >
        {contents}
      </Typography>
    );
  }

  return (
    <NextLink
      {...anchorProps}
      href={href}
      style={{ color: 'inherit', textDecoration: 'none' }}
      transitionTypes={transitionTypes ? [...transitionTypes] : undefined}
    >
      <Typography className={className} component="span" sx={mergedLinkSx} variant={variant}>
        {contents}
      </Typography>
    </NextLink>
  );
});
