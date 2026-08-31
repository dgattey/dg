import { type CSSProperties, Fragment, type ReactNode } from 'react';
import { ProjectCard } from '../home/ProjectCard';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS, moreWorkOverflowPlacements } from './cutOutPlacements';
import styles from './home.module.css';
import {
  MORE_WORK_OVERFLOW_GRID_AREAS,
  type MoreWorkOverflowUnit,
  moreWorkFrames,
  moreWorkGridAreas,
  type SlottedProject,
} from './projectSlots';

function MoreWorkGrid({
  projects,
  sites,
  overflow = false,
}: {
  overflow?: boolean;
  projects: ReadonlyArray<SlottedProject>;
  sites?: ReactNode;
}) {
  const frames = moreWorkFrames(projects);
  const byArea = new Map(frames.map((frame) => [frame.gridArea, frame]));
  const order = ['mg', 'sd', 'cn', 'js', 'gn'] as const;
  const grid = overflow
    ? { areas: MORE_WORK_OVERFLOW_GRID_AREAS, rowGapPx: 56 }
    : moreWorkGridAreas({
        cn: byArea.has('cn'),
        gn: byArea.has('gn'),
        js: byArea.has('js'),
        mg: byArea.has('mg'),
        sd: sites != null,
      });
  const gridStyle: CSSProperties = {
    gridTemplateAreas: grid.areas,
    rowGap: grid.rowGapPx,
  };

  return (
    <div
      className={`collageMeasure collageMeasureGrid collageGridStack ${styles.moreWorkGrid}`}
      style={gridStyle}
    >
      {order.map((area) => {
        if (area === 'sd') {
          return sites ? <Fragment key="sd">{sites}</Fragment> : null;
        }
        const frame = byArea.get(area);
        if (!frame) {
          return null;
        }
        return (
          <ProjectCard
            {...frame.project}
            data-slot={frame.gridArea}
            key={frame.key}
            style={frame.style}
            surface="collage"
          />
        );
      })}
    </div>
  );
}

export function MoreWorkSheet({
  overflow,
  projects,
  sites,
}: {
  overflow: ReadonlyArray<MoreWorkOverflowUnit>;
  projects: ReadonlyArray<SlottedProject>;
  sites: ReactNode;
}) {
  return (
    <section aria-label="More work" className={`collageBleed ${styles.moreWork}`}>
      <div aria-hidden="true" className={`collageField ${styles.moreWorkField}`} />
      {CUT_OUT_PLACEMENTS.moreWork.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <MoreWorkGrid projects={projects} sites={sites} />
      {overflow.map((unit) => (
        <div className={styles.overflow} key={unit.key}>
          {moreWorkOverflowPlacements(unit.key).map((placement) => (
            <CutOut key={placement.id} placement={placement} />
          ))}
          <MoreWorkGrid overflow projects={unit.projects} />
        </div>
      ))}
    </section>
  );
}
