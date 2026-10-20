import 'server-only';

import { isMissingTokenError } from '@dg/shared-core/errors/MissingTokenError';
import { devConsoleRoute, musicRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { getServerTime } from '../../services/getServerTime';
import { getMusicHistory } from '../../services/music';
import { HISTORY_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperTag } from '../collage/PaperTag';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { musicDestinationLabel } from '../layouts/musicHeaderDestinations';
import { CollageHistorySkeleton } from './albums/collageAlbumCardTreatments';
import { groupTracksByDate } from './groupTracksByDate';
import { CollageMusicStatus, MusicHistorySections } from './MusicHistorySections';
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
    if (isMissingTokenError(error) && process.env.NODE_ENV === 'development') {
      redirect(devConsoleRoute);
    }
    throw error;
  }

  const serverTime = await getServerTime();
  const sections = groupTracksByDate(tracks, serverTime);

  if (sections.length === 0) {
    return (
      <CollageMusicStatus
        tag={
          <PaperTag className="collagePin music__stateTag" tiltDeg={-3} tone="ochre">
            Spotify
          </PaperTag>
        }
      >
        <p>No listening history yet.</p>
      </CollageMusicStatus>
    );
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

/**
 * Page shell stays synchronous so it commits in the same render as the
 * outgoing page. Awaiting here instead would suspend the whole route, the old
 * page would already be unmounted by the time this arrives, and the view
 * transition would have nothing to animate away from.
 */
export default function MusicPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost music__historyLayout">
      <CollageBackdrop backdrop={HISTORY_BACKDROP} />
      <CutLetters className="collagePageTitle" text={TITLE} />
      <Suspense fallback={<CollageHistorySkeleton />}>
        <MusicHistory />
      </Suspense>
    </section>
  );
}
