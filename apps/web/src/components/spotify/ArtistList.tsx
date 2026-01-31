import type { Artist } from '@dg/services/spotify/Track';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Typography } from '@mui/material';
import { Fragment } from 'react';

type ArtistListProps = {
  artists: Array<Artist>;
  color?: string;
  textShadow?: string;
};

type SeparatorProps = {
  index: number;
  fullList: Array<unknown>;
};

const getArtistListSx = (color?: string, textShadow?: string): SxObject => ({
  ...truncated(1),
  ...(color
    ? {
        '& a': {
          color: 'inherit',
        },
        color,
      }
    : {}),
  ...(textShadow ? { textShadow } : {}),
});

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
export function ArtistList({ artists, color, textShadow }: ArtistListProps) {
  return (
    <Typography component="span" sx={getArtistListSx(color, textShadow)} variant="body2">
      {artists.map((artist, index) => {
        return (
          <Fragment key={artist.id}>
            <Link
              href={artist.external_urls.spotify}
              isExternal={true}
              title={artist.name}
              variant="body2"
            >
              {artist.name}
            </Link>
            <span>{separator({ fullList: artists, index })}</span>
          </Fragment>
        );
      })}
    </Typography>
  );
}
