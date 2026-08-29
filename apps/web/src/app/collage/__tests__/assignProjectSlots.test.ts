import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { assignProjectSlots } from '../assignProjectSlots';
import { projectFrameAspect, projectFrameAspectRatio } from '../workSheetFrames';

const project = (title: string, overrides: Partial<RenderableProject> = {}): RenderableProject => ({
  link: { icon: null, title, url: `https://example.com/${title}` },
  thumbnail: { height: 400, url: `https://images.test/${title}.jpg`, width: 900 },
  title,
  ...overrides,
});

function titles(count: number): Array<RenderableProject> {
  return Array.from({ length: count }, (_, index) => project(`P${index + 1}`));
}

describe('assignProjectSlots', () => {
  it('returns empty slices for zero projects', () => {
    expect(assignProjectSlots([])).toEqual({
      coda: null,
      moreWork: [],
      overflow: [],
      work: [],
    });
  });

  it('fills work, more work, and coda for seven projects in source order', () => {
    const slots = assignProjectSlots(titles(7));
    expect(slots.work.map((item) => item.key)).toEqual(['p-0', 'p-1']);
    expect(slots.moreWork.map((item) => item.key)).toEqual(['p-2', 'p-3', 'p-4', 'p-5']);
    expect(slots.coda?.key).toBe('p-6');
    expect(slots.overflow).toEqual([]);
    expect(slots.work.map((item) => item.project.title)).toEqual(['P1', 'P2']);
    expect(slots.moreWork.map((item) => item.project.title)).toEqual(['P3', 'P4', 'P5', 'P6']);
    expect(slots.coda?.project.title).toBe('P7');
  });

  it('chunks overflow after the coda for nine projects', () => {
    const slots = assignProjectSlots(titles(9));
    expect(slots.overflow).toHaveLength(1);
    expect(slots.overflow[0]?.key).toBe('overflow-0');
    expect(slots.overflow[0]?.projects.map((item) => item.key)).toEqual(['p-7', 'p-8']);
  });

  it('keeps overflow units at most four projects for larger counts', () => {
    const slots = assignProjectSlots(titles(16));
    expect(slots.overflow.map((unit) => unit.projects.map((item) => item.key))).toEqual([
      ['p-7', 'p-8', 'p-9', 'p-10'],
      ['p-11', 'p-12', 'p-13', 'p-14'],
      ['p-15'],
    ]);
    expect(slots.overflow.map((unit) => unit.key)).toEqual([
      'overflow-0',
      'overflow-1',
      'overflow-2',
    ]);
  });

  it('preserves wide, square, and tall layouts on slotted projects', () => {
    const slots = assignProjectSlots([
      project('Wide', { layout: 'wide' }),
      project('Square', { layout: 'square' }),
      project('Tall', { layout: 'tall' }),
      project('Default'),
      project('Wide2', { layout: 'wide' }),
      project('Square2', { layout: 'square' }),
      project('Tall2', { layout: 'tall' }),
    ]);

    expect(slots.work.map((item) => item.project.layout)).toEqual(['wide', 'square']);
    expect(slots.moreWork.map((item) => item.project.layout)).toEqual([
      'tall',
      undefined,
      'wide',
      'square',
    ]);
    expect(slots.coda?.project.layout).toBe('tall');
    expect(projectFrameAspect('tall')).toBe('tall');
    expect(projectFrameAspectRatio('tall')).toBe(0.8);
    expect(projectFrameAspectRatio('wide')).toBe(2.25);
    expect(projectFrameAspectRatio('square')).toBe(1);
  });

  it('keeps unique keys when titles and urls duplicate', () => {
    const duplicate = project('Same', {
      link: { icon: null, title: 'Same', url: 'https://dup.test' },
    });
    const slots = assignProjectSlots([
      duplicate,
      duplicate,
      duplicate,
      duplicate,
      duplicate,
      duplicate,
      duplicate,
      duplicate,
    ]);
    const keys = [
      ...slots.work.map((item) => item.key),
      ...slots.moreWork.map((item) => item.key),
      slots.coda?.key,
      ...slots.overflow.flatMap((unit) => unit.projects.map((item) => item.key)),
    ];
    expect(keys).toEqual(['p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-7']);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
