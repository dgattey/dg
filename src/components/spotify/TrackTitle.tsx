import type { Track } from 'api/types/spotify/Track';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import styled from '@emotion/styled';

type TrackTitleProps = {
  name: Track['name'];
  external_urls: Track['external_urls'];
};

// Link should inherit colors from its parent
const PlainLink = styled(Link)`
  color: inherit;
`;

/**
 * Creates an element that shows a track title that links to the song
 */
export function TrackTitle({ name, external_urls }: TrackTitleProps) {
  const link = useLinkWithName('Spotify', { title: name, url: external_urls.spotify });
  return link ? (
    <PlainLink isExternal {...link}>
      {name}
    </PlainLink>
  ) : (
    <span>name</span>
  );
}
