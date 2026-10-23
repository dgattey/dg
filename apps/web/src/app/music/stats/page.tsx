import 'server-only';
import '../../collage/pills.css';
import '../music.css';
import './stats.css';
import './statsShapes.css';

import { musicStatsRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getInitialListeningStatsSnapshots } from '../../../services/musicStats';
import { loadListeningStats } from '../../../services/musicStats.actions';
import { STATS_BACKDROP } from '../../collage/backdrops';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { musicDestinationTitle } from '../../layouts/musicHeaderDestinations';
import { NoListeningHistory } from '../MusicHistorySections';
import { MusicPageShell } from '../MusicPageShell';
import { ListeningStatsSections } from './ListeningStatsSections';
import { ListeningStatsSkeleton } from './ListeningStatsSkeleton';

const TITLE = musicDestinationTitle(musicStatsRoute);

export const metadata: Metadata = {
  alternates: markdownAlternates(musicStatsRoute),
  description: 'Totals, top albums, and listening habits from my Spotify history.',
  title: TITLE,
};

async function ListeningStats() {
  const snapshots = await getInitialListeningStatsSnapshots();
  return snapshots ? (
    <ListeningStatsSections
      initialSnapshots={snapshots}
      onLoadRange={loadListeningStats}
      stats={snapshots.all}
    />
  ) : (
    <NoListeningHistory />
  );
}

export default function MusicStatsPage() {
  return (
    <MusicPageShell backdrop={STATS_BACKDROP} title={TITLE}>
      <Suspense fallback={<ListeningStatsSkeleton />}>
        <ListeningStats />
      </Suspense>
    </MusicPageShell>
  );
}
