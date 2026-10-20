import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import {
  assignProjectSlots,
  CODA_FRAME_STYLE,
  moreWorkFrames,
  projectFrameAspectRatio,
  projectTabTone,
  projectTagMeta,
  workSheetFrames,
} from '../projectSlots';
import { PAPER_TONES } from '../types';

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

  it('derives a contrasting tab tone for every paper tone and every project slot', () => {
    expect(projectTabTone('ochre')).toBe('viridian');
    expect(projectTabTone('cream')).toBe('vermilion');
    expect(projectTabTone('black')).toBe('ochre');
    expect(projectTabTone('cerulean')).toBe('ochre');
    expect(projectTabTone('viridian')).toBe('ochre');
    expect(projectTabTone('vermilion')).toBe('cream');
    expect(projectTabTone('rose')).toBe('black');
    expect(projectTabTone('chartreuse')).toBe('black');
    expect(projectTabTone('ultramarine')).toBe('ochre');

    for (const tone of PAPER_TONES) {
      expect(projectTabTone(tone)).not.toBe(tone);
    }

    const slots = assignProjectSlots(projects(7));
    const allStyles = [
      ...workSheetFrames(slots.work).map(({ style }) => style),
      ...moreWorkFrames(slots.moreWork).map(({ style }) => style),
      CODA_FRAME_STYLE,
    ];

    for (const style of allStyles) {
      expect(projectTabTone(style.fieldTone)).not.toBe(style.fieldTone);
    }
  });
});
