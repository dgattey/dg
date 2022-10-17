import type { Artist, Track } from '@dg/api/types/spotify/Track';
import Link from '@dg/components/Link';
import useLinkWithName from '@dg/hooks/useLinkWithName';
import { Fragment } from 'react';
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
 * Creates a separator for use after an item at index
 */
const separator = ({ index, fullList }: SeparatorProps) => {
  if (index === fullList.length - 1) {
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
          <Fragment key={artist.id}>
            {link ? (
              <PlainLink isExternal {...link}>
                {artist.name}
              </PlainLink>
            ) : (
              artist.name
            )}
            <span>{separator({ index, fullList: artists })}</span>
          </Fragment>
        );
      })}
    </>
  );
};

export default ArtistList;
