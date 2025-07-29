import { Typography } from '@mui/material';
import { Link } from 'ui/dependent/Link';
import { mixinSx } from 'ui/helpers/mixinSx';
import { truncated } from 'ui/helpers/truncated';
import type { SxProps } from 'ui/theme';
import { useLinkWithName } from '../../hooks/useLinkWithName';

type TrackTitleProps = {
  trackTitle: string;
  url: string;
  sx?: SxProps;
};

/**
 * Creates an element that shows a track title that links to the song
 */
export function TrackTitle({ trackTitle, url, sx }: TrackTitleProps) {
  const link = useLinkWithName('Spotify', { title: trackTitle, url });
  const mixedSx = mixinSx(truncated(2), sx);
  return link ? (
    <Link
      isExternal={true}
      {...link}
      href={link.url}
      linkProps={{ color: 'h5', variant: 'h5' }}
      sx={mixedSx}
    >
      {trackTitle}
    </Link>
  ) : (
    <Typography component="span" sx={mixedSx} variant="h5">
      {trackTitle}
    </Typography>
  );
}
