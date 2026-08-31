import type { CSSProperties, ReactNode } from 'react';
import { ProjectCard } from '../home/ProjectCard';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import styles from './home.module.css';
import { type SlottedProject, workSheetFrames, workSheetGridAreas } from './projectSlots';

export function WorkSheet({
  projects,
  spotify,
  strava,
}: {
  projects: ReadonlyArray<SlottedProject>;
  spotify: ReactNode;
  strava: ReactNode;
}) {
  const frames = workSheetFrames(projects);
  const projectOne = frames.find((frame) => frame.gridArea === 'c1');
  const projectTwo = frames.find((frame) => frame.gridArea === 'ws');
  const grid = workSheetGridAreas({
    c1: projectOne !== undefined,
    sp: spotify != null,
    st: strava != null,
    ws: projectTwo !== undefined,
  });
  const gridStyle: CSSProperties = {
    gridTemplateAreas: grid.areas,
    rowGap: grid.rowGapPx,
  };

  return (
    <section aria-label="Work" className={`collageBleed ${styles.work}`}>
      <div aria-hidden="true" className={`collageField ${styles.workField}`} />
      {CUT_OUT_PLACEMENTS.workSheet.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <div
        className={`collageMeasure collageMeasureGrid collageGridStack ${styles.workGrid}`}
        style={gridStyle}
      >
        {projectOne ? (
          <ProjectCard
            {...projectOne.project}
            data-slot="c1"
            key={projectOne.key}
            style={projectOne.style}
            surface="collage"
          />
        ) : null}
        {spotify}
        {strava}
        {projectTwo ? (
          <ProjectCard
            {...projectTwo.project}
            data-slot="ws"
            key={projectTwo.key}
            style={projectTwo.style}
            surface="collage"
          />
        ) : null}
      </div>
    </section>
  );
}
