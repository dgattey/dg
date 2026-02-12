import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { Stack, Typography } from '@mui/material';
import { redirect } from 'next/navigation';
import { getMusicHistory } from '../../../services/music';
import { MusicInfiniteScroll } from './MusicInfiniteScroll';

export default async function MusicPage() {
  let tracks: Awaited<ReturnType<typeof getMusicHistory>>['tracks'];
  let nextCursor: Awaited<ReturnType<typeof getMusicHistory>>['nextCursor'];

  try {
    const result = await getMusicHistory({});
    tracks = result.tracks;
    nextCursor = result.nextCursor;
  } catch (error) {
    // In development, redirect to the dev page to set up OAuth
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect('/dev');
    }
    throw error;
  }

  return (
    <main>
      <Stack spacing={2}>
        <Typography variant="h1">Listening history</Typography>
        <MusicInfiniteScroll initialCursor={nextCursor} initialTracks={tracks} />
      </Stack>
    </main>
  );
}
