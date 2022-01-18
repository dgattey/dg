import { Link as LinkProps } from 'api/contentful/generated/api.generated';
import NextLink from 'next/link';
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

type Props = LinkProps & {
  /**
   * If it's an icon link, also shows the title of the link
   */
  alwaysShowTitle?: boolean;
};

const IconLink = styled.a``;

const SpacedTitle = styled.span`
  margin-left: 0.25rem;
`;

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

/**
 * Renders a link component from Contentful. Sometimes the icons are
 * just specifications for what to render using an icon library,
 * sometimes they're actual SVG html. When in doubt we assume html.
 */
const Link = ({ title, url, icon, alwaysShowTitle }: Props) => {
  if (!url) {
    return null;
  }
  const builtInIcon = icon ? BUILT_IN_ICONS[icon] : null;
  const titleOrNull = alwaysShowTitle ? <SpacedTitle>{title}</SpacedTitle> : null;
  return icon ? (
    <NextLink href={url} passHref>
      {builtInIcon ? (
        <IconLink data-tooltip={alwaysShowTitle ? null : title}>
          {builtInIcon}
          {titleOrNull}
        </IconLink>
      ) : (
        <IconLink data-tooltip={title} dangerouslySetInnerHTML={{ __html: icon }} />
      )}
    </NextLink>
  ) : (
    <NextLink href={url}>{title}</NextLink>
  );
};

export default Link;
