import type { SlottedProject } from './assignProjectSlots';
import type { ProjectFrameStyle } from './workSheetFrames';

export type MoreWorkGridArea = 'mg' | 'cn' | 'js' | 'gn';

export type MoreWorkFrame = {
  gridArea: MoreWorkGridArea;
  key: SlottedProject['key'];
  project: SlottedProject['project'];
  style: ProjectFrameStyle;
};

const MORE_WORK_AREAS: ReadonlyArray<MoreWorkGridArea> = ['mg', 'cn', 'js', 'gn'];

const MORE_WORK_FRAME_STYLES: ReadonlyArray<ProjectFrameStyle> = [
  {
    edge: 'quad-b',
    printTone: 'var(--olive)',
    tagClassName: 'tagBottomLeft',
    tagTiltDeg: 3,
    tagTone: 'ultramarine',
    tiltDeg: -1.6,
  },
  {
    edge: 'quad-c',
    printTone: 'var(--vermilion)',
    tagClassName: 'tagBottomRight',
    tagTiltDeg: -2,
    tagTone: 'cream',
    tiltDeg: 1.4,
  },
  {
    edge: 'quad-d',
    printTone: 'var(--ochre)',
    tagClassName: 'tagTopLeft',
    tagTiltDeg: 2.5,
    tagTone: 'ochre',
    tiltDeg: -1,
  },
  {
    edge: 'quad-a',
    printTone: 'var(--ultramarine)',
    tagClassName: 'tagBottomLeft',
    tagTiltDeg: -2,
    tagTone: 'vermilion',
    tiltDeg: 0.7,
  },
];

export function moreWorkFrames(projects: ReadonlyArray<SlottedProject>): Array<MoreWorkFrame> {
  const frames: Array<MoreWorkFrame> = [];
  for (const [index, gridArea] of MORE_WORK_AREAS.entries()) {
    const slotted = projects[index];
    const style = MORE_WORK_FRAME_STYLES[index];
    if (!slotted || !style) {
      continue;
    }
    frames.push({
      gridArea,
      key: slotted.key,
      project: slotted.project,
      style,
    });
  }
  return frames;
}
