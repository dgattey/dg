import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { devConsoleRoute, musicRoute } from '@dg/shared-core/routes/app';
import './music.css';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getMusicHistory } from '../../services/music';
import { HISTORY_BACKDROP } from '../collage/backdrops';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { musicDestinationTitle } from '../layouts/musicHeaderDestinations';
import { CollageHistorySkeleton } from './albums/collageAlbumCardTreatments';
import { MusicInfiniteScroll } from './MusicInfiniteScroll';
import { MusicPageShell } from './MusicPageShell';

const TITLE = musicDestinationTitle(musicRoute);

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
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect(devConsoleRoute);
    }
    throw error;
  }

  return <MusicInfiniteScroll initialCursor={nextCursor} initialTracks={tracks} />;
}

export default function MusicPage() {
  return (
    <MusicPageShell backdrop={HISTORY_BACKDROP} navFrom={musicRoute} title={TITLE}>
      <Suspense fallback={<CollageHistorySkeleton />}>
        <MusicHistory />
      </Suspense>
    </MusicPageShell>
  );
}
