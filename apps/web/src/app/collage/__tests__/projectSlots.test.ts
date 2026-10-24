import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import {
  assignProjectSlots,
  CODA_FRAME_STYLE,
  MORE_WORK_FRAMES,
  moreWorkFrames,
  projectFrameAspectRatio,
  projectTagMeta,
  projectTagTone,
  WORK_FRAMES,
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
      'Website, App · 2026',
    );
    expect(
      projectTagMeta({
        creationDate: '2026-03-03',
        type: ['Desktop app', 'Website', 'iOS app'],
      }),
    ).toBe('Desktop app, Website, iOS app · 2026');
    expect(projectTagMeta({ creationDate: '2026-03-01', type: ['Desktop app'] })).toBe(
      'Desktop app · 2026',
    );
    expect(projectTagMeta({ creationDate: '2020-05-01', type: 'macOS app' })).toBe(
      'macOS app · 2020',
    );
    expect(projectTagMeta({ creationDate: '2021-08-01', type: 'iOS app' })).toBe('iOS app · 2021');
    expect(projectTagMeta({ creationDate: null, type: 'Website' })).toBeNull();
  });

  it('pairs a wide third project with gn and a regular fourth project with js in More work', () => {
    const moreWork = [
      {
        key: 'p-2',
        project: {
          layout: 'regular',
          thumbnail: { height: 640, url: 'https://images.test/merge.webp', width: 640 },
          title: 'Merge',
        },
      },
      {
        key: 'p-3',
        project: {
          layout: 'regular',
          thumbnail: { height: 1000, url: 'https://images.test/canal.png', width: 1000 },
          title: 'Canal',
        },
      },
      {
        key: 'p-4',
        project: {
          layout: 'wide',
          thumbnail: { height: 1302, url: 'https://images.test/genera.png', width: 2874 },
          title: 'Genera',
        },
      },
      {
        key: 'p-5',
        project: {
          layout: 'regular',
          thumbnail: { height: 1001, url: 'https://images.test/jumpstart.png', width: 1000 },
          title: 'Jumpstart',
        },
      },
    ];

    expect(
      moreWorkFrames(moreWork).map(({ gridArea, project }) => [gridArea, project.title]),
    ).toEqual([
      ['mg', 'Merge'],
      ['cn', 'Canal'],
      ['js', 'Jumpstart'],
      ['gn', 'Genera'],
    ]);
  });

  it('derives a contrasting tab tone for every paper tone and project slot', () => {
    for (const tone of PAPER_TONES) {
      expect(projectTagTone(tone)).not.toBe(tone);
    }
    for (const frame of [...WORK_FRAMES, ...MORE_WORK_FRAMES, { style: CODA_FRAME_STYLE }]) {
      expect(projectTagTone(frame.style.fieldTone)).not.toBe(frame.style.fieldTone);
    }
    expect(projectTagTone('cobalt')).toBe('ochre');
    expect(projectTagTone('ochre')).toBe('viridian');
  });
});
