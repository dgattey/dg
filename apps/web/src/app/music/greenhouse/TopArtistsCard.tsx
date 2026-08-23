import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Box, Typography } from '@mui/material';
import { greenhouseCardHeaderSx, greenhouseCardSx, greenhouseListSx } from './greenhouseCardSx';
import { MusicListRow } from './MusicListRow';
import type { RankedArtist } from './types';

type Props = {
  artists: ReadonlyArray<RankedArtist>;
};

export function TopArtistsCard({ artists }: Props) {
  if (artists.length === 0) {
    return null;
  }

  return (
    <ContentCard data-top-artists="" sx={greenhouseCardSx}>
      <Box sx={greenhouseCardHeaderSx}>
        <Typography variant="overline">Listening</Typography>
        <Typography component="h3" variant="h3">
          Top artists
        </Typography>
      </Box>
      <Box component="ol" sx={{ ...greenhouseListSx, listStyle: 'none', margin: 0, padding: 0 }}>
        {artists.map((artist, index) => (
          <Box component="li" key={artist.id}>
            <MusicListRow
              href={artist.url}
              imageAlt={artist.name}
              imageUrl={artist.imageUrl}
              meta={`${artist.playCount} ${artist.playCount === 1 ? 'play' : 'plays'}`}
              rank={index + 1}
              title={artist.name}
            />
          </Box>
        ))}
      </Box>
    </ContentCard>
  );
}
