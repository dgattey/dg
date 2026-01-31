import { Link } from '@dg/ui/dependent/Link';
import { truncated } from '@dg/ui/helpers/truncated';
import type { SxObject } from '@dg/ui/theme';

type TrackTitleProps = {
  trackTitle: string;
  url: string;
  color?: string;
  textShadow?: string;
  sx?: SxObject;
};

/**
 * Creates an element that shows a track title that links to the song
 */
export function TrackTitle({ trackTitle, url, color, textShadow, sx }: TrackTitleProps) {
  const mergedSx: SxObject = {
    ...truncated(2),
    ...(color ? { color } : {}),
    ...(textShadow ? { textShadow } : {}),
    ...(sx ?? {}),
  };

  return (
    <Link href={url} isExternal={true} sx={mergedSx} title={trackTitle} variant="h5">
      {trackTitle}
    </Link>
  );
}
