import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import type { SlottedProject } from '../assignProjectSlots';
import { moreWorkFrames } from '../moreWorkFrames';
import { projectFrameAspectRatio } from '../workSheetFrames';

const slotted = (
  sourceIndex: number,
  overrides: Partial<RenderableProject> = {},
): SlottedProject => ({
  key: `p-${sourceIndex}`,
  project: {
    thumbnail: { height: 400, url: `https://images.test/${sourceIndex}.jpg`, width: 900 },
    title: `P${sourceIndex}`,
    ...overrides,
  },
});

describe('moreWorkFrames', () => {
  it('returns no frames for an empty list', () => {
    expect(moreWorkFrames([])).toEqual([]);
  });

  it('zips up to four projects onto mg cn js gn', () => {
    const frames = moreWorkFrames([slotted(2), slotted(3), slotted(4), slotted(5), slotted(6)]);
    expect(frames.map((frame) => frame.gridArea)).toEqual(['mg', 'cn', 'js', 'gn']);
    expect(frames.map((frame) => frame.key)).toEqual(['p-2', 'p-3', 'p-4', 'p-5']);
  });

  it('preserves tall aspect ratio 0.8 on a slotted project', () => {
    const frames = moreWorkFrames([slotted(2, { layout: 'tall' })]);
    expect(projectFrameAspectRatio(frames[0]?.project.layout)).toBe(0.8);
  });
});
