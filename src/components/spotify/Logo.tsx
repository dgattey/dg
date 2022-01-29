import type { Track } from 'api/types/spotify/Track';
import Link from 'components/Link';
import useLinkWithName from 'hooks/useLinkWithName';
import { FaSpotify } from 'react-icons/fa';
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
    <BigLogoLink {...link}>
      <FaSpotify />
    </BigLogoLink>
  ) : null;
};

export default Logo;
