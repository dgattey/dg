import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { devConsoleRoute, musicRoute } from '@dg/shared-core/routes/app';
import { Stack } from '@mui/material';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getMusicHistory } from '../../../services/music';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { PageTitle } from '../../layouts/PageTitle';
import { MusicHistorySkeleton } from './MusicHistorySkeleton';
import { MusicInfiniteScroll } from './MusicInfiniteScroll';

const TITLE = musicDestinationLabel(musicRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(musicRoute),
  description: 'Recent tracks played on Spotify.',
  title: TITLE,
};

async function MusicHistory() {
  let tracks: Awaited<ReturnType<typeof getMusicHistory>>['tracks'];
  let nextCursor: Awaited<ReturnType<typeof getMusicHistory>>['nextCursor'];

  try {
    const result = await getMusicHistory({});
    tracks = result.tracks;
    nextCursor = result.nextCursor;
  } catch (error) {
    // In development, redirect to the dev console to set up OAuth
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect(devConsoleRoute);
    }
    throw error;
  }

  return (
    <Stack spacing={2}>
      <MusicInfiniteScroll initialCursor={nextCursor} initialTracks={tracks} />
    </Stack>
  );
}

/**
 * Page shell stays synchronous so it commits in the same render as the
 * outgoing page. Awaiting here instead would suspend the whole route, the old
 * page would already be unmounted by the time this arrives, and the view
 * transition would have nothing to animate away from.
 */
export default function MusicPage() {
  return (
    <>
      <PageTitle>{TITLE}</PageTitle>
      <Suspense fallback={<MusicHistorySkeleton />}>
        <MusicHistory />
      </Suspense>
    </>
  );
}
