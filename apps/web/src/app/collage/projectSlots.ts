import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import type { PaperTone } from './types';

export type SlottedProject = {
  key: string;
  project: RenderableProject;
};

export type MoreWorkOverflowUnit = {
  key: string;
  projects: ReadonlyArray<SlottedProject>;
};

export type ProjectFrameStyle = {
  fieldTone: PaperTone;
  marginTop?: number;
  tagClassName: 'tagBottomLeft' | 'tagBottomRight' | 'tagTopLeft';
  tagTiltDeg: number;
  tiltDeg: number;
};

export function projectTagTone(fieldTone: PaperTone): PaperTone {
  switch (fieldTone) {
    case 'ochre':
      return 'viridian';
    case 'cream':
      return 'vermilion';
    case 'black':
    case 'cerulean':
    case 'cobalt':
    case 'leaf':
    case 'ultramarine':
    case 'viridian':
      return 'ochre';
    case 'olive':
    case 'vermilion':
      return 'cream';
    case 'chartreuse':
    case 'rose':
      return 'black';
    default: {
      const exhaustiveCheck: never = fieldTone;
      return exhaustiveCheck;
    }
  }
}

type ProjectFrame<Area extends string> = SlottedProject & {
  gridArea: Area;
  style: ProjectFrameStyle;
};

export const WORK_FRAMES = [
  {
    gridArea: 'c1',
    style: { fieldTone: 'cobalt', tagClassName: 'tagTopLeft', tagTiltDeg: -3, tiltDeg: -0.8 },
  },
  {
    gridArea: 'ws',
    style: { fieldTone: 'vermilion', tagClassName: 'tagBottomRight', tagTiltDeg: 2, tiltDeg: 1 },
  },
] satisfies ReadonlyArray<{ gridArea: 'c1' | 'ws'; style: ProjectFrameStyle }>;

export const MORE_WORK_FRAMES = [
  {
    gridArea: 'mg',
    style: { fieldTone: 'ochre', tagClassName: 'tagBottomLeft', tagTiltDeg: 3, tiltDeg: -1.6 },
  },
  {
    gridArea: 'cn',
    style: { fieldTone: 'vermilion', marginTop: 44, tagClassName: 'tagBottomRight', tagTiltDeg: -2, tiltDeg: 1.4 },
  },
  {
    gridArea: 'gn',
    style: { fieldTone: 'cream', tagClassName: 'tagBottomLeft', tagTiltDeg: -2, tiltDeg: 0.7 },
  },
  {
    gridArea: 'js',
    style: { fieldTone: 'ochre', marginTop: 10, tagClassName: 'tagTopLeft', tagTiltDeg: 2.5, tiltDeg: -1 },
  },
] satisfies ReadonlyArray<{ gridArea: 'mg' | 'cn' | 'gn' | 'js'; style: ProjectFrameStyle }>;

export const CODA_FRAME_STYLE: ProjectFrameStyle = {
  fieldTone: 'ultramarine',
  tagClassName: 'tagBottomLeft',
  tagTiltDeg: 3,
  tiltDeg: -1.4,
};

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
  const sorted = [...projects].sort((left, right) => {
    const leftTime = left.creationDate ? Date.parse(left.creationDate) : Number.NEGATIVE_INFINITY;
    const rightTime = right.creationDate
      ? Date.parse(right.creationDate)
      : Number.NEGATIVE_INFINITY;
    if (leftTime === rightTime) return 0;
    return rightTime - leftTime;
  });
  const slotted = sorted.map(
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
  const rawTypes = (Array.isArray(project.type) ? project.type : [project.type])
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  const type = rawTypes.length > 0 ? rawTypes.join(', ') : null;
  const year = project.creationDate?.match(/^(\d{4})/)?.[1];
  return type && year ? `${type} · ${year}` : null;
}

const EMPTY_ROW = '". . . . . . . . . . . ."';

function fullRow(area: string): string {
  return `"${Array.from({ length: 12 }, () => area).join(' ')}"`;
}

function gridAreas(rows: readonly [string, string], gap: number) {
  return {
    areas: rows.join(' '),
    rowGapPx: rows.includes(EMPTY_ROW) ? 0 : gap,
  };
}

const WORK_RAIL_ROWS = [
  'sp sp sp sp c1 c1 c1 c1 c1 c1 c1 c1',
  'lt lt lt lt c1 c1 c1 c1 c1 c1 c1 c1',
  'tk tk tk tk . . . . . . . .',
  'bm bm bm bm bm . ws ws ws ws ws ws',
] as const;

/**
 * Wide grids run Now playing, the latest ride, the ticket pair, and the big map
 * down a left rail beside the two frames. The big map takes one more column, and
 * its row starts below the first frame's, so the extra column never meets it.
 * The second frame shares only the big map's row, so the two can center on each other.
 * Compact grids share two rows between the frames and the whole Strava card.
 */
export function workSheetGridAreas(slots: { c1: boolean; ws: boolean }): {
  areas: string;
  compactAreas: string;
  compactRowGapPx: number;
} {
  const compact = gridAreas(
    [
      slots.c1 ? '"c1 c1 c1 c1 c1 c1 c1 c1 . sp sp sp"' : fullRow('sp'),
      slots.ws ? '"st st st st st . ws ws ws ws ws ws"' : fullRow('st'),
    ],
    52,
  );
  return {
    areas: WORK_RAIL_ROWS.map(
      (row) => `"${row.replace(/c1|ws/g, (area) => (slots[area as keyof typeof slots] ? area : '.'))}"`,
    ).join(' '),
    compactAreas: compact.areas,
    compactRowGapPx: compact.rowGapPx,
  };
}

export function moreWorkGridAreas(slots: { cn: boolean; gn: boolean; js: boolean; mg: boolean }): {
  areas: string;
  rowGapPx: number;
} {
  const { cn, gn, js, mg } = slots;
  const rowOne = mg
    ? cn
      ? '"mg mg mg mg sd sd sd sd cn cn cn cn"'
      : '"mg mg mg mg mg mg sd sd sd sd sd sd"'
    : cn
      ? '"sd sd sd sd sd sd cn cn cn cn cn cn"'
      : fullRow('sd');
  const rowTwo = gn
    ? js
      ? '"gn gn gn gn gn gn gn gn js js js js"'
      : fullRow('gn')
    : js
      ? fullRow('js')
      : EMPTY_ROW;
  return gridAreas([rowOne, rowTwo], 56);
}

export const MORE_WORK_OVERFLOW_GRID_AREAS =
  '"mg mg mg mg mg mg cn cn cn cn cn cn" "gn gn gn gn gn gn gn gn js js js js"';
