import 'server-only';
import '../collage/pills.css';
import '../music/stats/statsShapes.css';
import './streetCoverage.css';
import './strava.css';
import './stravaPieces.css';

import { activitiesRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getStravaHistory } from '../../services/strava';
import { STRAVA_BACKDROP } from '../collage/backdrops';
import { CollageBackdrop } from '../collage/CollageBackdrop';
import { CutLetters } from '../collage/CutLetters';
import { PaperCard } from '../collage/PaperCard';
import { markdownAlternates } from '../layouts/markdownAlternates';
import { StravaHistorySections } from './StravaHistorySections';
import { StravaHistorySkeleton } from './StravaHistorySkeleton';

const TITLE = 'Big map';

export const metadata: Metadata = {
  alternates: markdownAlternates(activitiesRoute),
  description: "Every activity I've tracked over the years.",
  title: TITLE,
};

async function StravaHistoryView() {
  const history = await getStravaHistory();
  if (!history) {
    return (
      <PaperCard
        className="strava__empty"
        edge="quad-c"
        innerClassName="strava__emptyInner"
        tiltDeg={-1}
      >
        No activities yet.
      </PaperCard>
    );
  }
  return <StravaHistorySections history={history} />;
}

/**
 * Synchronous shell, like the music pages, so the title commits with the
 * outgoing page and the view transition has something to morph.
 */
export default function StravaPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost strava__layout">
      <CollageBackdrop backdrop={STRAVA_BACKDROP} />
      <div className="strava__intro">
        <CutLetters className="collagePageTitle strava__title" text={TITLE} />
      </div>
      <Suspense fallback={<StravaHistorySkeleton />}>
        <StravaHistoryView />
      </Suspense>
    </section>
  );
}
