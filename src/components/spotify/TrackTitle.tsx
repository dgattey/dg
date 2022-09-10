import type { Track } from '@dg/api/types/spotify/Track';
import Link from '@dg/components/Link';
import useLinkWithName from '@dg/hooks/useLinkWithName';
import styled from 'styled-components';

type Props = Track;

// Link should inherit colors from its parent
const PlainLink = styled(Link)`
  color: inherit;
`;

/**
 * Creates an element that shows a track title that links to the song
 */
const TrackTitle = ({ name, external_urls }: Props) => {
  const link = useLinkWithName('Spotify', { title: name, url: external_urls.spotify });
  return link ? (
    <PlainLink isExternal {...link}>
      {name}
    </PlainLink>
  ) : (
    <span>name</span>
  );
};

export default TrackTitle;
