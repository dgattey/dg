import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';

export type SlottedProject = {
  key: `p-${number}`;
  project: RenderableProject;
};

export type MoreWorkOverflowUnit = {
  key: `overflow-${number}`;
  projects: ReadonlyArray<SlottedProject>;
};

export type AssignedProjectSlots = {
  coda: SlottedProject | null;
  moreWork: ReadonlyArray<SlottedProject>;
  overflow: ReadonlyArray<MoreWorkOverflowUnit>;
  work: ReadonlyArray<SlottedProject>;
};

const WORK_COUNT = 2;
const MORE_WORK_COUNT = 4;
const OVERFLOW_UNIT_SIZE = 4;

function slotRange(
  projects: ReadonlyArray<RenderableProject>,
  start: number,
  endExclusive: number,
): Array<SlottedProject> {
  const slots: Array<SlottedProject> = [];
  for (
    let sourceIndex = start;
    sourceIndex < endExclusive && sourceIndex < projects.length;
    sourceIndex += 1
  ) {
    const project = projects[sourceIndex];
    if (!project) {
      continue;
    }
    slots.push({
      key: `p-${sourceIndex}`,
      project,
    });
  }
  return slots;
}

export function assignProjectSlots(
  projects: ReadonlyArray<RenderableProject>,
): AssignedProjectSlots {
  const work = slotRange(projects, 0, WORK_COUNT);
  const moreWork = slotRange(projects, WORK_COUNT, WORK_COUNT + MORE_WORK_COUNT);
  const codaIndex = WORK_COUNT + MORE_WORK_COUNT;
  const codaProject = projects[codaIndex];
  const coda: SlottedProject | null = codaProject
    ? { key: `p-${codaIndex}`, project: codaProject }
    : null;

  const overflow: Array<MoreWorkOverflowUnit> = [];
  let sourceIndex = codaIndex + 1;
  let unitIndex = 0;
  while (sourceIndex < projects.length) {
    const chunkEnd = Math.min(sourceIndex + OVERFLOW_UNIT_SIZE, projects.length);
    overflow.push({
      key: `overflow-${unitIndex}`,
      projects: slotRange(projects, sourceIndex, chunkEnd),
    });
    sourceIndex = chunkEnd;
    unitIndex += 1;
  }

  return { coda, moreWork, overflow, work };
}
