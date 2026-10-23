import type { Artist } from '@dg/content-models/spotify/Track';
import { Tooltip } from '@dg/ui/core/Tooltip';
import { Typography } from '@dg/ui/core/Typography';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';
import { Fragment } from 'react';

type ListingVariant = 'card' | 'compact';

type ArtistListProps = {
  artists: Array<Artist>;
  color?: string;
  textShadow?: string;
  listingVariant?: ListingVariant;
};

type SeparatorProps = {
  index: number;
  fullList: Array<unknown>;
};

const cardBaseSx: SxObject = {
  ...truncated(),
};

const compactBaseSx: SxObject = {
  ...truncated(),
  lineHeight: 1.2,
  opacity: 0.6,
};

const VARIANT_SX: Record<ListingVariant, SxObject> = {
  card: cardBaseSx,
  compact: compactBaseSx,
};

const TYPOGRAPHY_VARIANT: Record<ListingVariant, 'body2' | 'caption'> = {
  card: 'body2',
  compact: 'caption',
};

function getArtistListSx(
  listingVariant: ListingVariant,
  color?: string,
  textShadow?: string,
): SxObject {
  return {
    ...VARIANT_SX[listingVariant],
    ...(color
      ? {
          '& a': { color: 'inherit' },
          color,
          // An explicit color is already tuned for contrast; fading it again washes it out.
          opacity: 1,
        }
      : {}),
    ...(textShadow ? { textShadow } : {}),
  };
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
 * Creates a list of artists with smart separators, with the whole list in a
 * tooltip when it's cut off. Card variant renders each artist as a link;
 * compact variant renders plain text.
 */
export function ArtistList({
  artists,
  color,
  textShadow,
  listingVariant = 'card',
}: ArtistListProps) {
  const isLinked = listingVariant === 'card';
  const typographyVariant = TYPOGRAPHY_VARIANT[listingVariant];
  const fullList = artists
    .map((artist, index) => `${artist.name}${separator({ fullList: artists, index }) ?? ''}`)
    .join('');

  return (
    <Tooltip title={fullList} whenTruncated>
      <Typography
        component="span"
        sx={getArtistListSx(listingVariant, color, textShadow)}
        variant={typographyVariant}
      >
        {artists.map((artist, index) => (
          <Fragment key={artist.id}>
            {isLinked ? (
              <Link
                href={artist.externalUrls.spotify}
                isExternal={true}
                title={artist.name}
                variant={typographyVariant}
              >
                {artist.name}
              </Link>
            ) : (
              artist.name
            )}
            <span>{separator({ fullList: artists, index })}</span>
          </Fragment>
        ))}
      </Typography>
    </Tooltip>
  );
}
