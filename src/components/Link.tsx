import type { Link as LinkType } from 'api/types/generated/contentfulApi.generated';
import { FaIcon } from 'components/FaIcon';
import { faGithubAlt } from '@fortawesome/free-brands-svg-icons/faGithubAlt';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion';
import NextLink from 'next/link';

import styled from '@emotion/styled';

/**
 * Renders as a certain type of layout.
 * 1. 'text' renders just plain text
 * 2. 'icon' renders the icon with a tooltip
 * 4. 'plainIcon' renders just the icon, but without a tooltip
 * 3. 'plainIconAndText' renders the icon without a tooltip, next to text
 * 5. 'empty' renders a link without content - usually coupled with spanning the parent
 */
type Layout = 'text' | 'icon' | 'plainIcon' | 'plainIconAndText' | 'empty';

type LinkProps = Pick<LinkType, 'title' | 'url' | 'icon'> &
  Pick<React.ComponentProps<'div'>, 'className' | 'children'> & {
    /**
     * Defaults to `text` when there's no icon, or `icon` when one is specified
     */
    layout?: Layout;

    /**
     * Defaults to false, but can be set to true to add target="_blank" and
     * rel="noreferrer"
     */
    isExternal?: boolean;
  };

// Used a few times, required layout
type SubProps = Pick<LinkProps, 'title' | 'icon'> & { layout: Layout };

/**
 * All built in mappings for icon name to element
 */
const BUILT_IN_ICONS: Record<string, JSX.Element> = {
  strava: <FaIcon icon={faStrava} />,
  spotify: <FaIcon icon={faSpotify} />,
  github: <FaIcon icon={faGithubAlt} />,
  linkedin: <FaIcon icon={faLinkedinIn} />,
  instagram: <FaIcon icon={faInstagram} />,
  about: <FaIcon icon={faQuestion} />,
  email: <FaIcon icon={faPaperPlane} />,
};

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
export function Link({
  title,
  url,
  icon,
  layout: rawLayout,
  className,
  children,
  isExternal,
  ...props
}: LinkProps & Omit<React.ComponentProps<typeof NextLink>, 'href'>) {
  const layout = rawLayout ?? (icon && !children ? 'icon' : 'text');
  if (!url) {
    return null;
  }

  // If there's a custom or built in icon, create a link around it
  const iconElement = createIconElement({ title, icon, layout });
  return (
    <NextLink
      {...props}
      href={url}
      className={className}
      data-tooltip={tooltip({ title, icon, layout })}
      {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {layout === 'empty' ? null : children ?? iconElement ?? title}
    </NextLink>
  );
}
