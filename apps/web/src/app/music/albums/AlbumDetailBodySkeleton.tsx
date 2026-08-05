import { Skeleton, Stack } from '@mui/material';

const PLACEHOLDER_TRACKS = Array.from({ length: 6 }, (_, track) => `track-${track}`);

/**
 * Holds the well open at roughly its loaded height while the tracklist streams
 * in, so the grid below does not jump once it lands.
 */
export function AlbumDetailBodySkeleton() {
  return (
    <Stack spacing={1.5}>
      <Skeleton sx={{ maxWidth: 220 }} variant="text" width="40%" />
      <Skeleton sx={{ maxWidth: 320 }} variant="text" width="55%" />
      <Stack spacing={0.5}>
        {PLACEHOLDER_TRACKS.map((track) => (
          <Skeleton height={34} key={track} variant="text" />
        ))}
      </Stack>
    </Stack>
  );
}
