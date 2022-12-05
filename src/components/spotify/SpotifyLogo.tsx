import type { Track } from 'api/types/spotify/Track';
import { FaIcon } from 'components/FaIcon';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import { faSpotify } from '@fortawesome/free-brands-svg-icons/faSpotify';
import styled from '@emotion/styled';

type SpotifyLogoProps = {
  name: string;
  external_urls: Track['external_urls'];
};

const BigLogoLink = styled(Link)`
  line-height: 1;
  font-size: 3rem;
  margin: 0;
`;

/**
 * Creates an element that shows a Spotify logo + a link to a track
 */
export function SpotifyLogo({ name, external_urls }: SpotifyLogoProps) {
  const link = useLinkWithName('Spotify', { title: name, url: external_urls.spotify });
  return link ? (
    <BigLogoLink {...link} isExternal>
      <FaIcon icon={faSpotify} />
    </BigLogoLink>
  ) : null;
}
