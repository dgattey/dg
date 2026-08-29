import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import type { SlottedProject } from './assignProjectSlots';
import type { PaperEdge, PaperTone } from './types';

export type ProjectFrameAspect = 'square' | 'tall' | 'wide';

export type ProjectFrameTagClass = 'tagBottomLeft' | 'tagBottomRight' | 'tagTopLeft';

export type ProjectFrameStyle = {
  edge: PaperEdge;
  printTone: string;
  tagClassName: ProjectFrameTagClass;
  tagTiltDeg: number;
  tagTone: PaperTone;
  tiltDeg: number;
};

export type WorkSheetFrame = {
  gridArea: 'c1' | 'ws';
  key: SlottedProject['key'];
  project: RenderableProject;
  style: ProjectFrameStyle;
};

const WORK_FRAME_STYLES: ReadonlyArray<ProjectFrameStyle> = [
  {
    edge: 'quad-a',
    printTone: 'var(--ink-on-cream)',
    tagClassName: 'tagTopLeft',
    tagTiltDeg: -3,
    tagTone: 'ochre',
    tiltDeg: -0.8,
  },
  {
    edge: 'quad-d',
    printTone: 'var(--viridian)',
    tagClassName: 'tagBottomRight',
    tagTiltDeg: 2,
    tagTone: 'cream',
    tiltDeg: 1,
  },
];

const ASPECT_RATIO: Record<ProjectFrameAspect, number> = {
  square: 1,
  tall: 0.8,
  wide: 2.25,
};

export function workSheetFrames(projects: ReadonlyArray<SlottedProject>): Array<WorkSheetFrame> {
  const slots = [
    { gridArea: 'c1' as const, style: WORK_FRAME_STYLES[0] },
    { gridArea: 'ws' as const, style: WORK_FRAME_STYLES[1] },
  ];

  const frames: Array<WorkSheetFrame> = [];
  for (const [index, slot] of slots.entries()) {
    const slotted = projects[index];
    if (!slotted || !slot.style) {
      continue;
    }
    frames.push({
      gridArea: slot.gridArea,
      key: slotted.key,
      project: slotted.project,
      style: slot.style,
    });
  }
  return frames;
}

export function projectFrameAspect(layout: string | null | undefined): ProjectFrameAspect {
  if (layout === 'tall') {
    return 'tall';
  }
  if (layout === 'square') {
    return 'square';
  }
  if (layout === 'wide') {
    return 'wide';
  }
  return 'square';
}

export function projectFrameAspectRatio(layout: string | null | undefined): number {
  return ASPECT_RATIO[projectFrameAspect(layout)];
}

export function projectTagMeta(
  project: Pick<RenderableProject, 'creationDate' | 'type'>,
): string | null {
  const rawType = Array.isArray(project.type) ? project.type[0] : project.type;
  const type = typeof rawType === 'string' && rawType.length > 0 ? rawType : null;
  const yearMatch = project.creationDate?.match(/^(\d{4})/);
  const year = yearMatch?.[1] ?? null;
  if (!type || !year) {
    return null;
  }
  return `${type} · ${year}`;
}
