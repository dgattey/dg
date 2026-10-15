import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { Stack } from '@dg/ui/core/Stack';
import { StickyFadeBar } from '@dg/ui/core/StickyFadeBar';
import { Typography } from '@dg/ui/core/Typography';
import type { SxObject } from '@dg/ui/theme';
import type { ReactNode } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import type { TrackSection } from './groupTracksByDate';
import { MusicGrid } from './MusicGrid';

/** Trailing space comes from the bar's fade ramp, so only lead the label. */
const sectionHeaderSx: SxObject = {
  paddingBlockStart: 2,
};

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
  /** Index offset for collage section tilt/tone alternation. */
  sectionOffset?: number;
  sections: Array<TrackSection>;
  surface?: SiteSurface;
  /** Whether the first section should mark its first tile as an LCP candidate. */
  withLcpCandidate?: boolean;
};

/**
 * Renders date-grouped sections of listening history on either surface.
 * Shared between the server-rendered initial page and client infinite-scroll
 * continuation.
 */
export function MusicHistorySections({
  sectionOffset = 0,
  sections,
  surface = 'classic',
  withLcpCandidate = true,
}: Props) {
  if (surface === 'collage') {
    return (
      <>
        {sections.map((section, index) => {
          const sectionIndex = sectionOffset + index;
          return (
            <section aria-label={section.label} className="music__section" key={section.label}>
              <StickyFadeBar className="music__dateBar" surface="collage">
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
                surface="collage"
                tracks={section.tracks}
              />
            </section>
          );
        })}
      </>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <Stack key={section.label} spacing={1}>
          <StickyFadeBar>
            <Typography sx={sectionHeaderSx} variant="h2">
              {section.label}
            </Typography>
          </StickyFadeBar>
          <MusicGrid surface="classic" tracks={section.tracks} />
        </Stack>
      ))}
    </>
  );
}
