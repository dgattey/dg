import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
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

type Props = {
  /** Index offset for section tilt/tone alternation. */
  sectionOffset?: number;
  sections: Array<TrackSection>;
  /** Whether the first section should mark its first tile as an LCP candidate. */
  withLcpCandidate?: boolean;
};

/**
 * Renders date-grouped sections of listening history.
 * Shared between the server-rendered initial page and client infinite-scroll
 * continuation.
 */
export function MusicHistorySections({
  sectionOffset = 0,
  sections,
  withLcpCandidate = true,
}: Props) {
  return (
    <>
      {sections.map((section, index) => {
        const sectionIndex = sectionOffset + index;
        return (
          <section aria-label={section.label} className="music__section" key={section.label}>
            <StickyFadeBar className="music__dateBar">
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
            </StickyFadeBar>
            <MusicGrid
              hasLcpCandidate={withLcpCandidate && sectionIndex === 0}
              tracks={section.tracks}
            />
          </section>
        );
      })}
    </>
  );
}
