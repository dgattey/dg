import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import type { PaperEdge, PaperTone } from './types';

export type SlottedProject = {
  key: string;
  project: RenderableProject;
};

export type MoreWorkOverflowUnit = {
  key: string;
  projects: ReadonlyArray<SlottedProject>;
};

export type ProjectFrameStyle = {
  edge: PaperEdge;
  printTone: string;
  tagClassName: 'tagBottomLeft' | 'tagBottomRight' | 'tagTopLeft';
  tagTiltDeg: number;
  tagTone: PaperTone;
  tiltDeg: number;
};

type ProjectFrame<Area extends string> = SlottedProject & {
  gridArea: Area;
  style: ProjectFrameStyle;
};

const WORK_FRAMES = [
  {
    gridArea: 'c1',
    style: {
      edge: 'quad-a',
      printTone: 'var(--ink-on-cream)',
      tagClassName: 'tagTopLeft',
      tagTiltDeg: -3,
      tagTone: 'ochre',
      tiltDeg: -0.8,
    },
  },
  {
    gridArea: 'ws',
    style: {
      edge: 'quad-d',
      printTone: 'var(--viridian)',
      tagClassName: 'tagBottomRight',
      tagTiltDeg: 2,
      tagTone: 'cream',
      tiltDeg: 1,
    },
  },
] satisfies ReadonlyArray<{ gridArea: 'c1' | 'ws'; style: ProjectFrameStyle }>;

const MORE_WORK_FRAMES = [
  {
    gridArea: 'mg',
    style: {
      edge: 'quad-b',
      printTone: 'var(--olive)',
      tagClassName: 'tagBottomLeft',
      tagTiltDeg: 3,
      tagTone: 'ultramarine',
      tiltDeg: -1.6,
    },
  },
  {
    gridArea: 'cn',
    style: {
      edge: 'quad-c',
      printTone: 'var(--vermilion)',
      tagClassName: 'tagBottomRight',
      tagTiltDeg: -2,
      tagTone: 'cream',
      tiltDeg: 1.4,
    },
  },
  {
    gridArea: 'js',
    style: {
      edge: 'quad-d',
      printTone: 'var(--ochre)',
      tagClassName: 'tagTopLeft',
      tagTiltDeg: 2.5,
      tagTone: 'ochre',
      tiltDeg: -1,
    },
  },
  {
    gridArea: 'gn',
    style: {
      edge: 'quad-a',
      printTone: 'var(--ultramarine)',
      tagClassName: 'tagBottomLeft',
      tagTiltDeg: -2,
      tagTone: 'vermilion',
      tiltDeg: 0.7,
    },
  },
] satisfies ReadonlyArray<{ gridArea: 'mg' | 'cn' | 'js' | 'gn'; style: ProjectFrameStyle }>;

function framesFor<Area extends string>(
  projects: ReadonlyArray<SlottedProject>,
  definitions: ReadonlyArray<{ gridArea: Area; style: ProjectFrameStyle }>,
): Array<ProjectFrame<Area>> {
  return definitions.flatMap((definition, index) => {
    const project = projects[index];
    return project ? [{ ...project, ...definition }] : [];
  });
}

export function assignProjectSlots(projects: ReadonlyArray<RenderableProject>) {
  const slotted = projects.map(
    (project, index): SlottedProject => ({
      key: `p-${index}`,
      project,
    }),
  );
  const overflow: Array<MoreWorkOverflowUnit> = [];

  for (let start = 7; start < slotted.length; start += 4) {
    overflow.push({
      key: `overflow-${overflow.length}`,
      projects: slotted.slice(start, start + 4),
    });
  }

  return {
    coda: slotted[6] ?? null,
    moreWork: slotted.slice(2, 6),
    overflow,
    work: slotted.slice(0, 2),
  };
}

export function workSheetFrames(projects: ReadonlyArray<SlottedProject>) {
  return framesFor(projects, WORK_FRAMES);
}

export function moreWorkFrames(projects: ReadonlyArray<SlottedProject>) {
  return framesFor(projects, MORE_WORK_FRAMES);
}

export function projectFrameAspectRatio(layout: string | null | undefined): number {
  if (layout === 'wide') {
    return 2.25;
  }
  if (layout === 'tall') {
    return 0.8;
  }
  return 1;
}

export function projectTagMeta(
  project: Pick<RenderableProject, 'creationDate' | 'type'>,
): string | null {
  const rawType = Array.isArray(project.type) ? project.type[0] : project.type;
  const type = typeof rawType === 'string' && rawType.length > 0 ? rawType : null;
  const year = project.creationDate?.match(/^(\d{4})/)?.[1];
  return type && year ? `${type} · ${year}` : null;
}
