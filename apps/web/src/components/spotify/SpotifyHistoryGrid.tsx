import type { Track } from '@dg/content-models/spotify/Track';
import type { SxObject } from '@dg/ui/theme';
import { Box } from '@mui/material';
import { HistoryTrackThumbnail } from './HistoryTrackThumbnail';

type HistoryTrack = Track & { playedAt: string };

type Props = {
  tracks: Array<HistoryTrack>;
};

const gridSx: SxObject = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: {
    lg: 'repeat(8, 1fr)',
    md: 'repeat(6, 1fr)',
    sm: 'repeat(4, 1fr)',
    xs: 'repeat(3, 1fr)',
  },
};

export function SpotifyHistoryGrid({ tracks }: Props) {
  return (
    <Box sx={gridSx}>
      {tracks.map((track) => (
        <HistoryTrackThumbnail key={`${track.playedAt}-${track.id}`} track={track} />
      ))}
    </Box>
  );
}
