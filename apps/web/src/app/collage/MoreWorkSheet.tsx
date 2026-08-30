import { Fragment, type ReactNode } from 'react';
import { ProjectCard } from '../home/ProjectCard';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS, moreWorkOverflowPlacements } from './cutOutPlacements';
import styles from './home.module.css';
import { type MoreWorkOverflowUnit, moreWorkFrames, type SlottedProject } from './projectSlots';

type MoreWorkSheetProps = {
  overflow: ReadonlyArray<MoreWorkOverflowUnit>;
  projects: ReadonlyArray<SlottedProject>;
  sites: ReactNode;
};

const FRAME_CLASS = {
  cn: styles.projectCn,
  gn: styles.projectGn,
  js: styles.projectJs,
  mg: styles.projectMg,
} as const;

function MoreWorkGrid({
  projects,
  sites,
}: {
  projects: ReadonlyArray<SlottedProject>;
  sites?: ReactNode;
}) {
  const frames = moreWorkFrames(projects);
  const byArea = new Map(frames.map((frame) => [frame.gridArea, frame]));
  const order = ['mg', 'sd', 'cn', 'js', 'gn'] as const;

  return (
    <div className={`collageMeasure collageMeasureGrid collageGridStack ${styles.moreWorkGrid}`}>
      {order.map((area) => {
        if (area === 'sd') {
          if (!sites) {
            return null;
          }
          return <Fragment key="sd">{sites}</Fragment>;
        }
        const frame = byArea.get(area);
        if (!frame) {
          return null;
        }
        return (
          <ProjectCard
            {...frame.project}
            className={FRAME_CLASS[frame.gridArea]}
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

export function MoreWorkSheet({ overflow, projects, sites }: MoreWorkSheetProps) {
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
          <MoreWorkGrid projects={unit.projects} />
        </div>
      ))}
    </section>
  );
}
