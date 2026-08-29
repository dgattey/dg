import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import type { ReactNode } from 'react';
import { ProjectCard } from '../home/ProjectCard';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import { TornField } from './TornField';
import styles from './WorkSheet.module.css';
import { workSheetFrames } from './workSheetFrames';

type WorkSheetProps = {
  projects: ReadonlyArray<RenderableProject>;
  spotify: ReactNode;
  strava: ReactNode;
};

const FRAME_CLASS = {
  c1: styles.projectOne,
  ws: styles.projectTwo,
} as const;

export function WorkSheet({ projects, spotify, strava }: WorkSheetProps) {
  const frames = workSheetFrames(projects);
  const projectOne = frames.find((frame) => frame.gridArea === 'c1');
  const projectTwo = frames.find((frame) => frame.gridArea === 'ws');

  return (
    <section aria-label="Work" className={styles.sheet}>
      <TornField className={styles.field} />
      {CUT_OUT_PLACEMENTS.workSheet.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <div className={styles.grid}>
        {projectOne ? (
          <ProjectCard
            {...projectOne.project}
            className={FRAME_CLASS.c1}
            data-work-slot="c1"
            style={projectOne.style}
            surface="collage"
          />
        ) : null}
        {spotify}
        {strava}
        {projectTwo ? (
          <ProjectCard
            {...projectTwo.project}
            className={FRAME_CLASS.ws}
            data-work-slot="ws"
            style={projectTwo.style}
            surface="collage"
          />
        ) : null}
      </div>
    </section>
  );
}
