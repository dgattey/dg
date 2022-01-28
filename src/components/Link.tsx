import type { Link as LinkProps } from 'api/types/generated/contentfulApi.generated';
import NextLink from 'next/link';
import React from 'react';
import {
  FaGithubAlt,
  FaInstagram,
  FaLinkedinIn,
  FaPaperPlane,
  FaQuestion,
  FaSpotify,
  FaStrava,
} from 'react-icons/fa';
import styled from 'styled-components';

/**
 * Renders as a certain type of layout.
 * 1. 'text' renders just plain text
 * 2. 'icon' renders the icon with a tooltip
 * 4. 'plainIcon' renders just the icon, but without a tooltip
 * 3. 'plainIconAndText' renders the icon without a tooltip, next to text
 * 5. 'empty' renders a link without content - usually coupled with spanning the parent
 */
type Layout = 'text' | 'icon' | 'plainIcon' | 'plainIconAndText' | 'empty';

type Props = Pick<LinkProps, 'title' | 'url' | 'icon'> &
  Pick<React.ComponentProps<'div'>, 'className' | 'children'> & {
    /**
     * Defaults to `text` when there's no icon, or `icon` when one is specified
     */
    layout?: Layout;
  };

// Used a few times, required layout
type SubProps = Pick<Props, 'title' | 'icon'> & { layout: Layout };

/**
 * All built in mappings for icon name to element
 */
const BUILT_IN_ICONS: Record<string, JSX.Element> = {
  strava: <FaStrava />,
  spotify: <FaSpotify />,
  github: <FaGithubAlt />,
  linkedin: <FaLinkedinIn />,
  instagram: <FaInstagram />,
  about: <FaQuestion />,
  email: <FaPaperPlane />,
};

// Allows us to use with the right props
const StyledLink = styled.a``;

// Used for setting internal HTML for a non-built in icon
const NonBuiltInIcon = styled.span``;

// When we render the title with an icon, we need some spacing
const WithIconTitle = styled.span`
  margin-left: 0.25rem;
`;

/**
 * If there's an icon, returns it, either built in or not, along with its title if
 * the layout calls for it.
 */
const createIconElement = ({ icon, title, layout }: SubProps) =>
  icon && !['empty', 'text'].includes(layout) ? (
    <>
      {BUILT_IN_ICONS[icon] ?? <NonBuiltInIcon dangerouslySetInnerHTML={{ __html: icon }} />}
      {layout === 'plainIconAndText' && <WithIconTitle>{title}</WithIconTitle>}
    </>
  ) : null;

/**
 * Creates the tooltip contents if the layout calls for it
 */
const tooltip = ({ title, layout }: SubProps) =>
  layout === 'icon' ? title ?? undefined : undefined;

/**
 * Renders a link component from Contentful. Sometimes the icons are
 * just specifications for what to render using an icon library,
 * sometimes they're actual SVG html. Renders according to the layout,
 * or defaults to `icon` if one is specified, otherwise `text`. Returns
 * null if no link at all.
 */
const Link = ({ title, url, icon, layout: rawLayout, className, children }: Props) => {
  const layout = rawLayout ?? (icon && !children ? 'icon' : 'text');
  if (!url) {
    return null;
  }

  // If there's a custom or built in icon, create a link around it
  const iconElement = createIconElement({ title, icon, layout });
  return (
    <NextLink href={url} passHref>
      <StyledLink className={className} data-tooltip={tooltip({ title, icon, layout })}>
        {layout === 'empty' ? null : children ?? iconElement ?? title}
      </StyledLink>
    </NextLink>
  );
};

export default Link;