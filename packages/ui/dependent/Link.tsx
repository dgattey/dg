import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import type { ButtonProps, LinkProps as MuiLinkProps } from '@mui/material';
import { Button, Link as MuiLink } from '@mui/material';
import { Send } from 'lucide-react';
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

  /**
   * Passed to Next.js Link for View Transition typing on internal navigations.
   * Ignored for external and forcePageNavigation links.
   */
  transitionTypes?: ReadonlyArray<string>;

  /**
   * Only usable from client components.
   */
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;

  /**
   * Optional ARIA role for the underlying anchor (e.g. menuitem in a disclosure).
   */
  role?: React.AriaRole;
};

/**
 * Either a standard link or a button-styled link
 */
type LinkProps = BaseLinkProps &
  ({ isButton: true; buttonProps?: ButtonProps<'a'> } | { isButton?: false; buttonProps?: never });

/**
 * Official Cursor cube mark (simple-icons / cursor brand), sized like FaIcon
 * peers so footer icons share caption color via currentColor.
 */
function CursorIcon({ size = '1em' }: { size?: string }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        height: size,
        width: size,
      }}
    >
      {/* Decorative: parent Link provides aria-label / tooltip title */}
      {/* biome-ignore lint/a11y/noSvgWithoutTitle: decorative peer to FaIcon */}
      <svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
        <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
      </svg>
    </span>
  );
}

/**
 * All built in mappings for icon name to element. Brand marks come from Font
 * Awesome since lucide-react v1 dropped brand icons for trademark reasons.
 * Cursor is not in FA; map the Contentful `icon: "cursor"` string the same way.
 */
const BUILT_IN_ICONS: Record<string, React.ReactNode> = {
  cursor: <CursorIcon />,
  email: <Send size="1em" />,
  github: <FaIcon icon={faGithub} />,
  instagram: <FaIcon icon={faInstagram} />,
  linkedin: <FaIcon icon={faLinkedinIn} />,
  spotify: <FaIcon icon={faSpotify} />,
  strava: <FaIcon icon={faStrava} />,
};

/**
 * Resolves the link layout and returns the rendered contents + whether
 * the link should show a tooltip (icon-only links with a title).
 */
function resolveContents({
  children,
  icon,
  layout = 'text',
  title,
}: Pick<BaseLinkProps, 'children' | 'icon' | 'layout' | 'title'>) {
  if (children) {
    return { contents: children, showTooltip: false };
  }

  const iconElement = icon
    ? (BUILT_IN_ICONS[icon] ?? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Intended!
        <span dangerouslySetInnerHTML={{ __html: icon }} />
      ))
    : null;

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
    transitionTypes,
    onClick,
    role,
  },
  ref,
) {
  if (!href) {
    return null;
  }

  const { contents, showTooltip } = resolveContents({
    children,
    icon,
    layout: initialLayout,
    title,
  });
  const anchorProps = {
    'aria-label': title,
    onClick,
    ref,
    role,
  };
  const externalProps = isExternal ? { rel: 'noreferrer' as const, target: '_blank' as const } : {};
  const muiStyleProps = { color, sx, underline, variant };
  const wrap = (el: React.ReactElement) =>
    wrapWithTooltip(el, showTooltip, title, tooltipPlacement);

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
    <NextLink
      {...anchorProps}
      href={href}
      style={{ color: 'inherit', textDecoration: 'none' }}
      transitionTypes={transitionTypes ? [...transitionTypes] : undefined}
    >
      <MuiLink component="span" {...muiStyleProps}>
        {contents}
      </MuiLink>
    </NextLink>,
  );
});
