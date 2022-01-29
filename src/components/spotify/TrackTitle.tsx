import type { Track } from 'api/types/spotify/Track';
import Link from 'components/Link';
import useLinkWithName from 'hooks/useLinkWithName';
import { useMemo } from 'react';
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
  const baseLink = useLinkWithName('Spotify');
  const link = useMemo(() => {
    if (!baseLink) {
      return null;
    }
    return { ...baseLink, title: name, url: external_urls.spotify };
  }, [baseLink, name, external_urls.spotify]);
  return link ? <PlainLink {...link}>{name}</PlainLink> : <span>name</span>;
};

export default TrackTitle;
