import { SxProps, Typography, Theme } from '@mui/material';
import { Link } from 'components/Link';
import { useLinkWithName } from 'hooks/useLinkWithName';

type TrackTitleProps = {
  trackTitle: string;
  url: string;
  sx?: SxProps<Theme>;
};

/**
 * Creates an element that shows a track title that links to the song
 */
export function TrackTitle({ trackTitle, url, sx }: TrackTitleProps) {
  const link = useLinkWithName('Spotify', { title: trackTitle, url });
  return link ? (
    <Link isExternal {...link} href={link.url} linkProps={{ variant: 'h5', color: 'h5' }}>
      {trackTitle}
    </Link>
  ) : (
    <Typography variant="h5" component="span" sx={sx}>
      {trackTitle}
    </Typography>
  );
}
