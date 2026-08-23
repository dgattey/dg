import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Box, Typography } from '@mui/material';
import { greenhouseCardHeaderSx, greenhouseCardSx, greenhouseListSx } from './greenhouseCardSx';
import { MusicListRow } from './MusicListRow';
import type { RankedTrack } from './types';

type Props = {
  tracks: ReadonlyArray<RankedTrack>;
};

export function TopTracksCard({ tracks }: Props) {
  if (tracks.length === 0) {
    return null;
  }

  return (
    <ContentCard data-top-tracks="" sx={greenhouseCardSx}>
      <Box sx={greenhouseCardHeaderSx}>
        <Typography variant="overline">Listening</Typography>
        <Typography component="h3" variant="h3">
          Top tracks
        </Typography>
      </Box>
      <Box component="ol" sx={{ ...greenhouseListSx, listStyle: 'none', margin: 0, padding: 0 }}>
        {tracks.map((track, index) => (
          <Box component="li" key={track.id}>
            <MusicListRow
              href={track.url}
              imageAlt={track.title}
              imageUrl={track.imageUrl}
              meta={track.artist}
              rank={index + 1}
              title={track.title}
            />
          </Box>
        ))}
      </Box>
    </ContentCard>
  );
}
