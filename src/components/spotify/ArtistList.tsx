import type { Artist } from 'api/types/spotify/Track';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import { Fragment } from 'react';
import { Typography } from '@mui/material';
import { truncated } from 'helpers/truncated';

type ArtistListProps = {
  artists: Array<Artist>;
};

interface SeparatorProps {
  index: number;
  fullList: Array<unknown>;
}

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
  if (!artists) {
    return null;
  }

  return (
    <Typography component="span" variant="body2" sx={truncated(1)}>
      {artists.map((artist, index) => {
        const link = artistLink(artist);
        return (
          <Fragment key={artist.id}>
            {link ? (
              <Link
                isExternal
                {...link}
                href={link.url}
                linkProps={{ variant: 'body2', color: 'body2' }}
              >
                {artist.name}
              </Link>
            ) : (
              <span>{artist.name}</span>
            )}
            <span>{separator({ index, fullList: artists })}</span>
          </Fragment>
        );
      })}
    </Typography>
  );
}
