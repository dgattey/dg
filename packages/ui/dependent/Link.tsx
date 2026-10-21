import { Send } from 'lucide-react';
import NextLink from 'next/link';
import React from 'react';
import { Box } from '../core/Box';
import type { TooltipPlacement } from '../core/Tooltip';
import { Tooltip } from '../core/Tooltip';
import { Typography, type TypographyVariant } from '../core/Typography';
import {
  FaIcon,
  faGithub,
  faInstagram,
  faLinkedinIn,
  faSpotify,
  faStrava,
  faXTwitter,
} from '../icons/FaIcon';
import type { SxObject, SxProps } from '../theme';

type LinkColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'info'
  | 'warning'
  | 'textPrimary'
  | 'textSecondary'
  | 'text.primary'
  | 'text.secondary';

type LinkUnderline = 'none' | 'hover' | 'always';

export type BaseLinkProps = {
  title?: string;
  href: string | undefined;
  icon?: string;

  /**
   * Can be missing for icon-only links
   */
  children?: React.ReactNode;

  /**
   * Style prop for link styling
   */
  sx?: SxProps;

  className?: string;

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
   * Link color token
   */
  color?: LinkColor;

  /**
   * Link underline behavior
   */
  underline?: LinkUnderline;

  /**
   * Typography variant
   */
  variant?: TypographyVariant | 'inherit';

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

  /**
   * Optional ARIA current page marker for nav links.
   */
  'aria-current'?: 'page';
};

const PALETTE_LINK_COLORS = new Set([
  'primary',
  'secondary',
  'info',
  'success',
  'error',
  'warning',
]);

function buildLinkSx(
  color: LinkColor = 'inherit',
  underline: LinkUnderline = 'hover',
  sx?: SxProps,
): SxProps {
  const colorStyles: SxObject = PALETTE_LINK_COLORS.has(color)
    ? {
        '&:hover': {
          color: `var(--mui-palette-${color}-dark)`,
        },
        color: `var(--mui-palette-${color}-main)`,
        transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      }
    : color === 'textPrimary' || color === 'text.primary'
      ? { color: 'var(--mui-palette-text-primary)' }
      : color === 'textSecondary' || color === 'text.secondary'
        ? { color: 'var(--mui-palette-text-secondary)' }
        : { color: 'inherit' };

  const underlineStyles: SxObject =
    underline === 'always'
      ? {
          '&:hover': {
            textDecorationColor: 'inherit',
            ...(colorStyles['&:hover'] as SxObject),
          },
          textDecoration: 'underline',
          textDecorationColor: 'color-mix(in srgb, currentColor 40%, transparent)',
        }
      : underline === 'hover'
        ? {
            '&:hover': {
              textDecoration: 'underline',
              ...(colorStyles['&:hover'] as SxObject),
            },
            textDecoration: 'none',
          }
        : {
            textDecoration: 'none',
          };

  const base: SxObject = {
    cursor: 'pointer',
    ...colorStyles,
    ...underlineStyles,
  };
  return Array.isArray(sx) ? [base, ...sx] : sx ? [base, sx] : base;
}

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
 * All built in mappings for icon name to element.
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
  x: <FaIcon icon={faXTwitter} />,
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

  const iconElement = icon ? (BUILT_IN_ICONS[icon] ?? <span>{icon}</span>) : null;

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
  id?: string,
) {
  if (!showTooltip) {
    return element;
  }
  return (
    <Tooltip id={id} placement={placement} title={title}>
      {element}
    </Tooltip>
  );
}

/**
 * Server-compatible Link component with Next.js navigation and theme styling.
 */
export const Link = React.forwardRef<HTMLAnchorElement, BaseLinkProps>(function Link(
  {
    title,
    href,
    icon,
    children,
    isExternal,
    forcePageNavigation,
    layout: initialLayout = 'text',
    className,
    sx,
    color = 'inherit',
    underline = 'hover',
    variant,
    tooltipPlacement,
    transitionTypes,
    onClick,
    role,
    'aria-current': ariaCurrent,
  },
  ref,
) {
  const generatedTooltipId = React.useId();
  if (!href) {
    return null;
  }

  const { contents, showTooltip } = resolveContents({
    children,
    icon,
    layout: initialLayout,
    title,
  });
  const tooltipId = showTooltip ? `tooltip-${generatedTooltipId}` : undefined;
  const anchorProps = {
    'aria-current': ariaCurrent,
    'aria-describedby': tooltipId,
    'aria-label': title,
    onClick,
    ref,
    role,
  };
  const externalProps = isExternal ? { rel: 'noreferrer' as const, target: '_blank' as const } : {};
  const resolvedVariant = variant && variant !== 'inherit' ? variant : 'body1';
  const mergedLinkSx = buildLinkSx(color, underline, sx);
  const wrap = (el: React.ReactElement) =>
    wrapWithTooltip(el, showTooltip, title, tooltipPlacement, tooltipId);

  if (isExternal || forcePageNavigation) {
    return wrap(
      <Typography
        {...anchorProps}
        className={className}
        component="a"
        href={href}
        sx={mergedLinkSx}
        variant={resolvedVariant}
        {...externalProps}
      >
        {contents}
      </Typography>,
    );
  }

  return wrap(
    <NextLink
      {...anchorProps}
      href={href}
      style={{ color: 'inherit', textDecoration: 'none' }}
      transitionTypes={transitionTypes ? [...transitionTypes] : undefined}
    >
      <Typography
        className={className}
        component="span"
        sx={mergedLinkSx}
        variant={resolvedVariant}
      >
        {contents}
      </Typography>
    </NextLink>,
  );
});
