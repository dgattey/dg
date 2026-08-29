import { ProjectCard } from '../home/ProjectCard';
import type { SlottedProject } from './assignProjectSlots';
import styles from './CodaSheet.module.css';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import type { ProjectFrameStyle } from './workSheetFrames';

type CodaSheetProps = {
  project: SlottedProject | null;
};

const CODA_FRAME_STYLE: ProjectFrameStyle = {
  edge: 'quad-b',
  printTone: 'var(--cerulean)',
  tagClassName: 'tagBottomLeft',
  tagTiltDeg: 3,
  tagTone: 'rose',
  tiltDeg: -1.4,
};

export function CodaSheet({ project }: CodaSheetProps) {
  if (!project) {
    return null;
  }

  return (
    <section aria-label="And" className={styles.sheet}>
      {CUT_OUT_PLACEMENTS.coda.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <div className={styles.grid}>
        <ProjectCard
          {...project.project}
          className={styles.project}
          data-slot="li"
          key={project.key}
          style={CODA_FRAME_STYLE}
          surface="collage"
        />
      </div>
    </section>
  );
}
