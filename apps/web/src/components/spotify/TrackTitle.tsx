import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';

type TrackTitleProps = {
  trackTitle: string;
  url: string;
  maxLines?: number;
  color?: string;
  textShadow?: string;
  sx?: SxObject;
  variant?: 'h5' | 'h6';
};

/**
 * Creates an element that shows a track title that links to the song
 */
export function TrackTitle({
  trackTitle,
  url,
  maxLines = 2,
  color,
  textShadow,
  sx,
  variant = 'h5',
}: TrackTitleProps) {
  const mergedSx: SxObject = {
    ...truncated(maxLines),
    ...(color ? { color } : {}),
    ...(textShadow ? { textShadow } : {}),
    ...(sx ?? {}),
  };

  return (
    <Link href={url} isExternal={true} sx={mergedSx} title={trackTitle} variant={variant}>
      {trackTitle}
    </Link>
  );
}
