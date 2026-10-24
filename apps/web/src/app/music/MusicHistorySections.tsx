import { musicStatsRangeRoute } from '@dg/shared-core/routes/app';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import { PageTransitionLink } from '@dg/ui/core/transitions/PageTransitionLink';
import type { ReactNode } from 'react';
import { PaperCard } from '../collage/PaperCard';
import { PaperTag } from '../collage/PaperTag';
import type { TrackSection } from './groupTracksByDate';
import { MusicGrid } from './MusicGrid';

export function CollageMusicStatus({ children, tag }: { children: ReactNode; tag?: ReactNode }) {
  return (
    <div className="music__state" role="status">
      <PaperCard
        edge="quad-c"
        innerClassName={`music__stateInner${tag ? '' : ` music__loadingInner`}`}
        tiltDeg={-1.5}
        tone="cream"
      >
        {children}
      </PaperCard>
      {tag}
    </div>
  );
}

/** Empty state shared by the history and stats pages. */
export function NoListeningHistory() {
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

function statsRangeLabel(range: TrackSection['statsRange']) {
  return typeof range === 'number' ? String(range) : `this ${range}`;
}

/** Renders date-grouped sections of listening history. */
export function MusicHistorySections({ sections }: { sections: Array<TrackSection> }) {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <section aria-label={section.label} className="music__section" key={section.label}>
          <StickyFadeBar className="music__dateBar">
            <div className="music__dateRow">
              <h2 className="music__dateHeading">
                <PaperTag
                  className="music__dateTag"
                  edge="soft-b"
                  tiltDeg={sectionIndex % 2 === 0 ? -1.2 : 0.8}
                  tone={sectionIndex % 2 === 0 ? 'cream' : 'ochre'}
                >
                  {section.label}
                </PaperTag>
              </h2>
              <PageTransitionLink
                className="music__dateStats"
                href={musicStatsRangeRoute(section.statsRange)}
                title={`Listening stats, ${statsRangeLabel(section.statsRange)}`}
              >
                Stats →
              </PageTransitionLink>
            </div>
          </StickyFadeBar>
          <MusicGrid hasLcpCandidate={sectionIndex === 0} tracks={section.tracks} />
        </section>
      ))}
    </>
  );
}
