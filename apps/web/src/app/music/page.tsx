import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { Sheet } from '@dg/ui/core/Sheet';
import { Stack } from '@mui/material';
import { redirect } from 'next/navigation';
import { getMusicHistory } from '../../services/music';
import { MusicInfiniteScroll } from './MusicInfiniteScroll';

export default async function MusicPage() {
  let tracks: Awaited<ReturnType<typeof getMusicHistory>>['tracks'];
  let nextCursor: Awaited<ReturnType<typeof getMusicHistory>>['nextCursor'];

  try {
    const result = await getMusicHistory({});
    tracks = result.tracks;
    nextCursor = result.nextCursor;
  } catch (error) {
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect('/dev');
    }
    throw error;
  }

  return (
    <Sheet title="Listening history">
      <Stack spacing={2}>
        <MusicInfiniteScroll initialCursor={nextCursor} initialTracks={tracks} />
      </Stack>
    </Sheet>
  );
}
