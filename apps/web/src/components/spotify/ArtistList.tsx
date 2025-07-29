// Need to get rid of this when I clean up API

import { Typography } from '@mui/material';
import type { Artist } from 'api/spotify/Track';
import { Fragment } from 'react';
import { Link } from 'ui/dependent/Link';
import { truncated } from 'ui/helpers/truncated';
import { useLinkWithName } from '../../hooks/useLinkWithName';

type ArtistListProps = {
  artists: Array<Artist>;
};

type SeparatorProps = {
  index: number;
  fullList: Array<unknown>;
};

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
export function ArtistList({ artists }: ArtistListProps) {
  const baseLink = useLinkWithName('Spotify');
  const artistLink = ({ name, external_urls }: Artist) => {
    if (!baseLink) {
      return null;
    }
    return { ...baseLink, title: name, url: external_urls.spotify };
  };

  return (
    <Typography component="span" sx={truncated(1)} variant="body2">
      {artists.map((artist, index) => {
        const link = artistLink(artist);
        return (
          <Fragment key={artist.id}>
            {link ? (
              <Link
                isExternal={true}
                {...link}
                href={link.url}
                linkProps={{ color: 'body2', variant: 'body2' }}
              >
                {artist.name}
              </Link>
            ) : (
              <span>{artist.name}</span>
            )}
            <span>{separator({ fullList: artists, index })}</span>
          </Fragment>
        );
      })}
    </Typography>
  );
}
