import type { Artist, Track } from 'api/types/spotify/Track';
import Link from 'components/Link';
import useLinkWithName from 'hooks/useLinkWithName';
import React from 'react';
import styled from 'styled-components';

type Props = Track;

interface SeparatorProps {
  index: number;
  fullList: Array<unknown>;
}

const PlainLink = styled(Link)`
  color: inherit;
`;

/**
 * Creates an element that's added as a separator after an item
 */
const SeparatorText = ({ index, fullList }: SeparatorProps) => {
  const isLast = index === fullList.length - 1;
  const text = () => {
    if (isLast) {
      // Nothing after the last item!
      return null;
    }
    if (fullList.length === 2) {
      // Only two items in the full list means no commas
      return ' & ';
    }
    // Commas separate, or if there's only one item after this, an & sign after comma
    return index < fullList.length - 2 ? ', ' : ', & ';
  };
  // We end with a span regardless, so that we have the right overflow truncation
  return <span>{text()}</span>;
};

/**
 * Creates a list of artists, where each artist links
 * directly to their artist page. Uses inherited colors
 * for best usage with display elsewhere. Shows an underline
 * on hover.
 */
const ArtistList = ({ artists }: Props) => {
  const baseLink = useLinkWithName('Spotify');
  const artistLink = ({ name, external_urls }: Artist) => {
    if (!baseLink) {
      return null;
    }
    return { ...baseLink, title: name, url: external_urls.spotify };
  };
  if (!artists) {
    return null;
  }

  return (
    <>
      {artists.map((artist, index) => {
        const link = artistLink(artist);
        return (
          <React.Fragment key={artist.id}>
            {link ? <PlainLink {...link}>{artist.name}</PlainLink> : artist.name}
            <SeparatorText index={index} fullList={artists} />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default ArtistList;
