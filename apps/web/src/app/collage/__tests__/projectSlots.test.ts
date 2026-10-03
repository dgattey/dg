import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import {
  assignProjectSlots,
  moreWorkFrames,
  projectFrameAspectRatio,
  projectTagMeta,
  workSheetFrames,
} from '../projectSlots';

function projects(count: number): Array<RenderableProject> {
  return Array.from({ length: count }, (_, index) => ({
    layout: index % 3 === 0 ? 'wide' : index % 3 === 1 ? 'square' : 'tall',
    thumbnail: { height: 400, url: `https://images.test/${index}.jpg`, width: 900 },
    title: `P${index + 1}`,
  }));
}

describe('projectSlots', () => {
  it('preserves source order through every page section', () => {
    const slots = assignProjectSlots(projects(7));
    expect(slots.work.map(({ project }) => project.title)).toEqual(['P1', 'P2']);
    expect(slots.moreWork.map(({ project }) => project.title)).toEqual(['P3', 'P4', 'P5', 'P6']);
    expect(slots.coda?.project.title).toBe('P7');
    expect(workSheetFrames(slots.work).map(({ gridArea }) => gridArea)).toEqual(['c1', 'ws']);
    expect(moreWorkFrames(slots.moreWork).map(({ gridArea }) => gridArea)).toEqual([
      'mg',
      'cn',
      'js',
      'gn',
    ]);
  });

  it.each([
    [0, []],
    [9, [['p-7', 'p-8']]],
    [16, [['p-7', 'p-8', 'p-9', 'p-10'], ['p-11', 'p-12', 'p-13', 'p-14'], ['p-15']]],
  ])('chunks overflow for %i projects', (count, expected) => {
    expect(
      assignProjectSlots(projects(count)).overflow.map(({ projects: chunk }) =>
        chunk.map(({ key }) => key),
      ),
    ).toEqual(expected);
  });

  it('preserves project aspect and metadata', () => {
    expect(projectFrameAspectRatio('wide')).toBe(2.25);
    expect(projectFrameAspectRatio('tall')).toBe(0.8);
    expect(projectFrameAspectRatio('square')).toBe(1);
    expect(projectTagMeta({ creationDate: '2026-03-01', type: ['Website', 'App'] })).toBe(
      'Website · 2026',
    );
    expect(projectTagMeta({ creationDate: null, type: 'Website' })).toBeNull();
  });
});
