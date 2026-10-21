import 'server-only';
import './stats.css';
import './statsShapes.css';

import { musicStatsRoute } from '@dg/shared-core/routes/app';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getListeningStats } from '../../../services/musicStats';
import { STATS_BACKDROP } from '../../collage/backdrops';
import { CollageBackdrop } from '../../collage/CollageBackdrop';
import { CutLetters } from '../../collage/CutLetters';
import { PaperButton } from '../../collage/PaperButton';
import { PaperCard } from '../../collage/PaperCard';
import { markdownAlternates } from '../../layouts/markdownAlternates';
import { MUSIC_DESTINATIONS, musicDestinationLabel } from '../../layouts/musicHeaderDestinations';
import { ListeningStatsSections } from './ListeningStatsSections';
import { ListeningStatsSkeleton } from './ListeningStatsSkeleton';

const TITLE = musicDestinationLabel(musicStatsRoute);
const NAV_TILTS = [-1, 1, -0.5] as const;

export const metadata: Metadata = {
  alternates: markdownAlternates(musicStatsRoute),
  description: 'Totals, top albums, and listening habits from my Spotify history.',
  title: TITLE,
};

async function ListeningStats() {
  const stats = await getListeningStats();
  if (!stats) {
    return (
      <PaperCard className="stats__empty" edge="quad-c" innerClassName="stats__lede" tiltDeg={-1}>
        No listening history yet.
      </PaperCard>
    );
  }
  return <ListeningStatsSections stats={stats} />;
}

/**
 * Synchronous shell, like the other music pages, so the title commits with the
 * outgoing page and the view transition has something to morph.
 */
export default function MusicStatsPage() {
  return (
    <section aria-label={TITLE} className="collageBackdropHost stats__layout">
      <CollageBackdrop backdrop={STATS_BACKDROP} />
      <div className="stats__intro">
        <CutLetters className="collagePageTitle" text={TITLE} />
        <div className="stats__cluster">
          <nav aria-label="Music pages" className="stats__nav">
            {MUSIC_DESTINATIONS.map((destination, i) => (
              <PaperButton
                current={destination.href === musicStatsRoute}
                href={destination.href}
                key={destination.href}
                tiltDeg={NAV_TILTS[i % NAV_TILTS.length]}
                title={destination.label}
              >
                {destination.label}
              </PaperButton>
            ))}
          </nav>
          <PaperCard innerClassName="stats__lede" tiltDeg={0.5}>
            Every play in my Spotify history, added up: what I play, when, and how often I hear an
            album front to back.
          </PaperCard>
        </div>
      </div>
      <Suspense fallback={<ListeningStatsSkeleton />}>
        <ListeningStats />
      </Suspense>
    </section>
  );
}
