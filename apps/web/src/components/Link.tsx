/* eslint-disable no-restricted-imports */
import { FaIcon } from 'components/FaIcon';
import { faGithubAlt } from '@fortawesome/free-brands-svg-icons/faGithubAlt';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import { faStrava } from '@fortawesome/free-brands-svg-icons/faStrava';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion';
import NextLink from 'next/link';
import {
  Link as MuiLink,
  LinkProps as MuiLinkProps,
  Tooltip,
  ButtonProps,
  Button,
} from '@mui/material';
import { SxProps } from 'ui/theme';

type BaseLinkProps = {
  title?: string;
  href: string | undefined;
  icon?: string;

  /**
   * Can be missing for icon-only links
   */
  children?: React.ReactNode;
  sx?: SxProps;

  /**
   * Renders as a certain type of layout.
   * 1. 'text' renders just plain text
   * 2. 'icon' renders the icon with a tooltip
   * 3. 'iconText' renders the icon without a tooltip, next to text
   * 5. 'children' renders just some children
   */
  layout?: 'text' | 'icon' | 'iconText';

  /**
   * Defaults to false, but can be set to true to add target="_blank" and
   * rel="noreferrer"
   */
  isExternal?: boolean;
};

/**
 * Either provides MUI link or button props depending on type
 */
type LinkProps = BaseLinkProps &
  (
    | { isButton: true; buttonProps?: ButtonProps; linkProps?: never }
    | { isButton?: never; linkProps?: MuiLinkProps; buttonProps?: never }
  );

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

/**
 * If there's an icon, returns it, either built in or not, along with its title if
 * the layout calls for it.
 */
const createIconElement = ({ icon, layout = 'text' }: Pick<BaseLinkProps, 'icon' | 'layout'>) =>
  icon && !['children', 'text'].includes(layout)
    ? // eslint-disable-next-line react/no-danger
      BUILT_IN_ICONS[icon] ?? <span dangerouslySetInnerHTML={{ __html: icon }} />
    : null;

/**
 * Renders a link component from Contentful. Sometimes the icons are
 * just specifications for what to render using an icon library,
 * sometimes they're actual SVG html. Renders according to the layout,
 * or defaults to `icon` if one is specified, otherwise `text`. Returns
 * null if no link at all.
 */
export function Link({
  title,
  href,
  icon,
  children,
  isButton,
  isExternal,
  layout: initialLayout = 'text',
  sx,
  linkProps,
  buttonProps,
}: LinkProps) {
  /**
   * Generates a layout enum for use in computing the contents
   */
  const layout = (() => {
    if (children) {
      return 'children';
    }
    if (initialLayout === 'text' && title) {
      return 'text';
    }
    if (['icon', 'iconText'].includes(initialLayout) && icon) {
      return initialLayout;
    }
    return 'text';
  })();

  if (!href || !layout) {
    return null;
  }

  // Tooltip shows up when there's just an icon, otherwise not needed
  const tooltipTitle = layout === 'icon' ? title : null;

  // If there's a custom or built in icon, create a link around it
  const contents = (() => {
    switch (layout) {
      case 'icon':
        return createIconElement({ icon, layout });
      case 'iconText':
        return (
          <>
            {createIconElement({ icon, layout })}
            <span style={{ marginLeft: 4 }}>{title}</span>
          </>
        );
      case 'text':
        return title;
      case 'children':
        return children;
    }
  })();
  const sharedProps = {
    component: NextLink,
    href,
    'aria-label': title,
    ...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {}),
    sx,
  };
  return (
    <Tooltip title={tooltipTitle} placement="top">
      {isButton ? (
        <Button {...buttonProps} {...sharedProps}>
          {contents}
        </Button>
      ) : (
        <MuiLink {...linkProps} {...sharedProps}>
          {contents}
        </MuiLink>
      )}
    </Tooltip>
  );
}
