import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import type { ButtonProps, LinkProps as MuiLinkProps } from '@mui/material';
import { Box, Button, Link as MuiLink } from '@mui/material';
import { Github, Instagram, Send } from 'lucide-react';
import NextLink from 'next/link';
import React from 'react';
import type { TooltipPlacement } from '../core/Tooltip';
import { Tooltip } from '../core/Tooltip';
import { FaIcon } from '../icons/FaIcon';
import type { SxProps } from '../theme';

export type LinkLayout = 'text' | 'icon' | 'iconText' | 'children';

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
   * Renders as a certain type of layout.
   * 1. 'text' renders just plain text
   * 2. 'icon' renders the icon with tooltip
   * 3. 'iconText' renders the icon without a tooltip, next to text
   * 4. 'children' renders just some children
   */
  layout?: 'text' | 'icon' | 'iconText';

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
 * If there's an icon, returns it, either built in or not, along with its title if
 * the layout calls for it.
 */
function createIconElement({
  icon,
  layout = 'text',
}: Pick<BaseLinkProps, 'icon' | 'layout'>): React.ReactNode | null {
  if (!icon || ['children', 'text'].includes(layout)) {
    return null;
  }
  // biome-ignore lint/security/noDangerouslySetInnerHtml: This is intended
  return BUILT_IN_ICONS[icon] ?? <span dangerouslySetInnerHTML={{ __html: icon }} />;
}

/**
 * Generates a layout enum for use in computing the contents.
 */
function resolveLinkLayout({
  children,
  icon,
  layout = 'text',
  title,
}: Pick<BaseLinkProps, 'children' | 'icon' | 'layout' | 'title'>): LinkLayout {
  if (children) {
    return 'children';
  }
  if (layout === 'text' && title) {
    return 'text';
  }
  if (['icon', 'iconText'].includes(layout) && icon) {
    return layout;
  }
  return 'text';
}

/**
 * Computes the rendered link contents for the given layout.
 */
function getLinkContents({
  children,
  icon,
  layout,
  title,
}: Pick<BaseLinkProps, 'children' | 'icon' | 'title'> & { layout: LinkLayout }) {
  switch (layout) {
    case 'icon':
      return createIconElement({ icon, layout });
    case 'iconText':
      return (
        <>
          {createIconElement({ icon, layout })}
          <Box component="span" sx={{ ml: 0.5 }}>
            {title}
          </Box>
        </>
      );
    case 'text':
      return title;
    case 'children':
      return children;
  }
}

function shouldUseTooltip(layout: LinkLayout, title?: string) {
  return layout === 'icon' && Boolean(title);
}

/**
 * Server-compatible Link component with Next.js navigation and MUI theming.
 *
 * Uses MuiLink for styling (theme colors, typography, underline) and wraps with
 * NextLink for internal navigation. This avoids the component={Function} pattern
 * that breaks RSC serialization.
 *
 * - Internal links: NextLink wraps MuiLink (prefetching + theming)
 * - External links: MuiLink with href (theming only, no prefetch needed)
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
  const layout = resolveLinkLayout({ children, icon, layout: initialLayout, title });

  if (!href) {
    return null;
  }

  const contents = getLinkContents({ children, icon, layout, title });
  const useTooltip = shouldUseTooltip(layout, title);
  const externalProps = isExternal ? { rel: 'noreferrer', target: '_blank' as const } : {};

  // Button variant uses MUI Button with href (renders as <a>)
  if (isButton) {
    const buttonElement = (
      <Button
        {...buttonProps}
        aria-label={title}
        href={href}
        {...externalProps}
        ref={ref}
        sx={sx}
        title={useTooltip ? undefined : title}
      >
        {contents}
      </Button>
    );

    if (useTooltip) {
      return (
        <Tooltip placement={tooltipPlacement} title={title}>
          {buttonElement}
        </Tooltip>
      );
    }
    return buttonElement;
  }

  // MuiLink provides theme integration (colors, typography, underline)
  const muiLinkElement = isExternal ? (
    <MuiLink
      aria-label={title}
      color={color}
      href={href}
      ref={ref}
      sx={sx}
      title={useTooltip ? undefined : title}
      underline={underline}
      variant={variant}
      {...externalProps}
    >
      {contents}
    </MuiLink>
  ) : (
    <MuiLink color={color} component="span" sx={sx} underline={underline} variant={variant}>
      {contents}
    </MuiLink>
  );

  // External links: MuiLink with href directly (no NextLink needed)
  // Internal links: NextLink wraps MuiLink (no legacyBehavior)
  const linkElement = isExternal ? (
    muiLinkElement
  ) : (
    <NextLink
      aria-label={title}
      href={href}
      ref={ref}
      style={{ color: 'inherit', textDecoration: 'none' }}
      title={useTooltip ? undefined : title}
    >
      {muiLinkElement}
    </NextLink>
  );

  if (useTooltip) {
    return (
      <Tooltip placement={tooltipPlacement} title={title}>
        {linkElement}
      </Tooltip>
    );
  }

  return linkElement;
});
