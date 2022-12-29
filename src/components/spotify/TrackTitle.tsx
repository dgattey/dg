import { Typography } from '@mui/material';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';
import { SxProps } from 'ui/theme';
import { truncated } from '../../helpers/truncated';
import { mixinSx } from '../../ui/helpers/mixinSx';

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
      isExternal
      {...link}
      href={link.url}
      linkProps={{ variant: 'h5', color: 'h5' }}
      sx={mixedSx}
    >
      {trackTitle}
    </Link>
  ) : (
    <Typography variant="h5" component="span" sx={mixedSx}>
      {trackTitle}
    </Typography>
  );
}
