import { Image } from '@dg/ui/dependent/Image';
import { Link } from '@dg/ui/dependent/Link';
import { Box, Typography } from '@mui/material';
import {
  GREENHOUSE_ROW_ART_SIZE,
  GREENHOUSE_ROW_ART_SIZES,
  greenhouseRowSx,
  greenhouseThumbSx,
} from './greenhouseCardSx';

type Props = {
  href: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  meta: string;
  rank: number;
};

/**
 * One glass-list row: cover thumb, title, caption, rank. Type variants only.
 */
export function MusicListRow({ href, imageUrl, imageAlt, title, meta, rank }: Props) {
  return (
    <Link href={href} isExternal={true} sx={greenhouseRowSx} title={title}>
      <Box sx={greenhouseThumbSx}>
        <Image
          alt={imageAlt}
          fill={true}
          height={GREENHOUSE_ROW_ART_SIZE}
          sizes={GREENHOUSE_ROW_ART_SIZES}
          url={imageUrl}
          width={GREENHOUSE_ROW_ART_SIZE}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography component="h5" variant="h5">
          {title}
        </Typography>
        <Typography variant="caption">{meta}</Typography>
      </Box>
      <Typography variant="caption">{rank}</Typography>
    </Link>
  );
}
