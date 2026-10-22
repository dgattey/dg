import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { devConsoleRoute, musicRoute } from '@dg/shared-core/routes/app';
import './music.css';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getServerTime } from '../../services/getServerTime';
import { getMusicHistory } from '../../services/music';
import { HISTORY_BACKDROP } from '../collage/backdrops';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { musicDestinationTitle } from '../layouts/musicHeaderDestinations';
import { CollageHistorySkeleton } from './albums/collageAlbumCardTreatments';
import { groupTracksByDate } from './groupTracksByDate';
import { MusicHistorySections, NoListeningHistory } from './MusicHistorySections';
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

  const serverTime = await getServerTime();
  const sections = groupTracksByDate(tracks, serverTime);

  if (sections.length === 0) {
    return <NoListeningHistory />;
  }

  return (
    <div className="music__history">
      <MusicHistorySections sections={sections} withLcpCandidate={true} />
      <MusicInfiniteScroll
        initialCursor={nextCursor}
        initialSectionOffset={sections.length}
        serverRenderedInitial={true}
      />
    </div>
  );
}

export default function MusicPage() {
  return (
    <MusicPageShell backdrop={HISTORY_BACKDROP} title={TITLE}>
      <Suspense fallback={<CollageHistorySkeleton />}>
        <MusicHistory />
      </Suspense>
    </MusicPageShell>
  );
}
