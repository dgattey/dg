import { Tooltip } from '@dg/ui/core/Tooltip';
import { Typography } from '@dg/ui/core/Typography';
import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';

type ListingVariant = 'card' | 'compact';

type TrackTitleProps = {
  trackTitle: string;
  /** If provided, renders as a link to this URL. If omitted, renders as plain text. */
  url?: string;
  color?: string;
  textShadow?: string;
  listingVariant?: ListingVariant;
};

const VARIANT_SX: Record<ListingVariant, SxObject> = {
  card: {
    ...truncated(1),
    marginBottom: 1,
  },
  compact: {
    ...truncated(1),
    lineHeight: 1.2,
  },
};

const TYPOGRAPHY_VARIANT: Record<ListingVariant, 'h5' | 'caption'> = {
  card: 'h5',
  compact: 'caption',
};

function getTrackTitleSx(
  listingVariant: ListingVariant,
  color?: string,
  textShadow?: string,
): SxObject {
  return {
    ...VARIANT_SX[listingVariant],
    ...(color ? { color } : {}),
    ...(textShadow ? { textShadow } : {}),
  };
}

/**
 * Shows a track title, optionally linked to the song on Spotify, with the full
 * title in a tooltip when it's cut off. Styling is driven by the parent
 * TrackListing's variant.
 */
export function TrackTitle({
  trackTitle,
  url,
  color,
  textShadow,
  listingVariant = 'card',
}: TrackTitleProps) {
  const sx = getTrackTitleSx(listingVariant, color, textShadow);
  const typographyVariant = TYPOGRAPHY_VARIANT[listingVariant];

  return (
    <Tooltip title={trackTitle} whenTruncated>
      {url ? (
        <Link href={url} isExternal={true} sx={sx} variant={typographyVariant}>
          {trackTitle}
        </Link>
      ) : (
        <Typography sx={sx} variant={typographyVariant}>
          {trackTitle}
        </Typography>
      )}
    </Tooltip>
  );
}
