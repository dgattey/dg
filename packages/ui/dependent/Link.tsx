import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import type { ButtonProps, LinkProps as MuiLinkProps } from '@mui/material';
import { Button, Link as MuiLink } from '@mui/material';
import { Github, Instagram, Send } from 'lucide-react';
import NextLink from 'next/link';
import React from 'react';
import type { TooltipPlacement } from '../core/Tooltip';
import { Tooltip } from '../core/Tooltip';
import { FaIcon } from '../icons/FaIcon';
import type { SxProps } from '../theme';

export type BaseLinkProps = {
  title?: string;
  href: string | undefined;
  icon?: string;

  /**
   * Can be missing for icon-only links
   */
  children?: React.ReactNode;

  /**
   * MUI sx prop for styling
   */
  sx?: SxProps;

  /**
   * Controls how the link content is rendered.
   * - 'text': renders just the title as plain text (default)
   * - 'icon': renders the icon with a tooltip showing the title
   * When `children` is provided, layout is ignored and children render directly.
   */
  layout?: 'text' | 'icon';

  /**
   * Defaults to false, but can be set to true to add target="_blank" and
   * rel="noreferrer"
   */
  isExternal?: boolean;

  /**
   * MUI Link color prop for theme colors
   */
  color?: MuiLinkProps['color'];

  /**
   * MUI Link underline behavior
   */
  underline?: MuiLinkProps['underline'];

  /**
   * MUI typography variant
   */
  variant?: MuiLinkProps['variant'];

  /**
   * Tooltip placement for icon-only links.
   * - 'bottom': Shows below trigger (default)
   * - 'top': Shows above trigger (useful for footer links)
   */
  tooltipPlacement?: TooltipPlacement;

  /**
   * When true, renders a plain `<a>` tag instead of wrapping with NextLink.
   * This forces a full page navigation (no prefetching, no client-side RSC
   * navigation). Useful for links to auth-protected pages where client-side
   * navigation would interfere with the auth flow.
   */
  forcePageNavigation?: boolean;
};

/**
 * Either a standard link or a button-styled link
 */
type LinkProps = BaseLinkProps &
  ({ isButton: true; buttonProps?: ButtonProps<'a'> } | { isButton?: false; buttonProps?: never });

/**
 * All built in mappings for icon name to element
 */
const BUILT_IN_ICONS: Record<string, React.ReactNode> = {
  email: <Send size="1em" />,
  github: <Github size="1em" />,
  instagram: <Instagram size="1em" />,
  linkedin: <FaIcon icon={faLinkedinIn} />,
  spotify: <FaIcon icon={faSpotify} />,
  strava: <FaIcon icon={faStrava} />,
};

/**
 * Resolves the link layout and returns the rendered contents + whether
 * the link should show a tooltip (icon-only links with a title).
 */
function resolveContents({ children, icon, layout = 'text', title }: Pick<BaseLinkProps, 'children' | 'icon' | 'layout' | 'title'>) {
  if (children) {
    return { contents: children, showTooltip: false };
  }

  // biome-ignore lint/security/noDangerouslySetInnerHtml: This is intended
  const iconElement = icon ? (BUILT_IN_ICONS[icon] ?? <span dangerouslySetInnerHTML={{ __html: icon }} />) : null;

  if (layout === 'icon' && iconElement) {
    return { contents: iconElement, showTooltip: Boolean(title) };
  }
  return { contents: title, showTooltip: false };
}

/**
 * Optionally wraps an element with a Tooltip (for icon-only links).
 */
function wrapWithTooltip(
  element: React.ReactElement,
  showTooltip: boolean,
  title?: string,
  placement?: TooltipPlacement,
) {
  if (!showTooltip) {
    return element;
  }
  return (
    <Tooltip placement={placement} title={title}>
      {element}
    </Tooltip>
  );
}

/**
 * Server-compatible Link component with Next.js navigation and MUI theming.
 *
 * - Internal links: NextLink wraps MuiLink `<span>` (prefetching + client nav)
 * - External links: MuiLink `<a>` with `target="_blank"` (no NextLink needed)
 * - `forcePageNavigation`: MuiLink `<a>` without NextLink (full page load,
 *   useful for auth-protected pages where client-side nav interferes)
 *
 * Supports icons, tooltips, and button variant.
 */
export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    title,
    href,
    icon,
    children,
    isButton,
    isExternal,
    forcePageNavigation,
    layout: initialLayout = 'text',
    sx,
    buttonProps,
    color = 'inherit',
    underline = 'hover',
    variant,
    tooltipPlacement,
  },
  ref,
) {
  if (!href) {
    return null;
  }

  const { contents, showTooltip } = resolveContents({ children, icon, layout: initialLayout, title });
  const anchorProps = {
    'aria-label': title,
    ref,
    title: showTooltip ? undefined : title,
  };
  const externalProps = isExternal ? { rel: 'noreferrer' as const, target: '_blank' as const } : {};
  const muiStyleProps = { color, sx, underline, variant };
  const wrap = (el: React.ReactElement) => wrapWithTooltip(el, showTooltip, title, tooltipPlacement);

  if (isButton) {
    return wrap(
      <Button {...buttonProps} {...anchorProps} href={href} {...externalProps} sx={sx}>
        {contents}
      </Button>,
    );
  }

  // External links and forcePageNavigation: plain <a> via MuiLink
  if (isExternal || forcePageNavigation) {
    return wrap(
      <MuiLink {...anchorProps} href={href} {...muiStyleProps} {...externalProps}>
        {contents}
      </MuiLink>,
    );
  }

  // Internal links: NextLink <a> wrapping MuiLink <span> for client-side nav
  return wrap(
    <NextLink {...anchorProps} href={href} style={{ color: 'inherit', textDecoration: 'none' }}>
      <MuiLink component="span" {...muiStyleProps}>
        {contents}
      </MuiLink>
    </NextLink>,
  );
});
