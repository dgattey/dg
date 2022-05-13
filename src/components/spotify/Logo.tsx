import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import type { Track } from 'api/types/spotify/Track';
import FaIcon from 'components/FaIcon';
import Link from 'components/Link';
import useLinkWithName from 'hooks/useLinkWithName';
import styled from 'styled-components';

type Props = Track;

const BigLogoLink = styled(Link)`
  line-height: 1;
  font-size: 3rem;
  margin: 0;
`;

/**
 * Creates an element that shows a Spotify logo + a link to a track
 */
const Logo = ({ name, external_urls }: Props) => {
  const link = useLinkWithName('Spotify', { title: name, url: external_urls.spotify });
  return link ? (
    <BigLogoLink {...link} isExternal>
      <FaIcon icon={faSpotify} />
    </BigLogoLink>
  ) : null;
};

export default Logo;
