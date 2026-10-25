import NextLink from 'next/link';
import React, { type AnchorHTMLAttributes, type CSSProperties } from 'react';
import { Typography, type TypographyVariant } from '../core/Typography';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'style' | 'title'> & {
  children?: React.ReactNode;
  className?: string;
  color?: string;
  href: string | undefined;
  isExternal?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  style?: CSSProperties;
  title?: string;
  transitionTypes?: ReadonlyArray<string>;
  variant?: TypographyVariant;
};

/**
 * Official Cursor cube mark (simple-icons / cursor brand), sized like FaIcon
 * peers so footer icons share caption color via currentColor.
 */
export function CursorIcon({ size = '1em' }: { size?: string }) {
  return (
    <span aria-hidden data-cursor-icon="" style={{ '--cursor-icon-size': size } as CSSProperties}>
      <svg aria-hidden="true" fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
        <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
      </svg>
    </span>
  );
}

/**
 * Server-compatible Link component with Next.js navigation and theme styling.
 * Inherits the parent's typography unless an explicit `variant` or `color` is passed.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    children,
    className,
    color,
    href,
    isExternal,
    onClick,
    style,
    title,
    transitionTypes,
    variant,
    ...rest
  },
  ref,
) {
  if (!href) {
    return null;
  }

  const contents = children ?? title;
  const anchorProps = {
    'aria-label': title,
    onClick,
    ref,
  };

  if (isExternal) {
    if (variant || color) {
      return (
        <Typography
          {...rest}
          {...anchorProps}
          as="a"
          className={className}
          color={color}
          data-ui-link=""
          href={href}
          rel="noreferrer"
          style={style}
          target="_blank"
          variant={variant}
        >
          {contents}
        </Typography>
      );
    }
    return (
      <a
        {...rest}
        {...anchorProps}
        className={className}
        data-ui-link=""
        href={href}
        rel="noreferrer"
        style={style}
        target="_blank"
      >
        {contents}
      </a>
    );
  }

  if (variant || color) {
    return (
      <NextLink
        {...anchorProps}
        data-ui-link-wrapper=""
        href={href}
        transitionTypes={transitionTypes ? [...transitionTypes] : undefined}
      >
        <Typography
          {...rest}
          as="span"
          className={className}
          color={color}
          data-ui-link=""
          style={style}
          variant={variant}
        >
          {contents}
        </Typography>
      </NextLink>
    );
  }

  return (
    <NextLink
      {...rest}
      {...anchorProps}
      className={className}
      data-ui-link=""
      href={href}
      style={style}
      transitionTypes={transitionTypes ? [...transitionTypes] : undefined}
    >
      {contents}
    </NextLink>
  );
});
