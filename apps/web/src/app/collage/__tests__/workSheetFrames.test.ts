import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { projectFrameAspect, projectTagMeta, workSheetFrames } from '../workSheetFrames';

const baseProject = (overrides: Partial<RenderableProject> = {}): RenderableProject => ({
  thumbnail: { height: 400, url: 'https://images.test/cursor.jpg', width: 900 },
  title: 'Cursor',
  ...overrides,
});

describe('workSheetFrames', () => {
  it('returns no frames for an empty project list', () => {
    expect(workSheetFrames([])).toEqual([]);
  });

  it('assigns the first project to c1', () => {
    const project = baseProject();
    const frames = workSheetFrames([project]);
    expect(frames).toHaveLength(1);
    expect(frames[0]?.gridArea).toBe('c1');
    expect(frames[0]?.project).toBe(project);
  });

  it('takes only the first two projects in source order', () => {
    const frames = workSheetFrames([
      baseProject({ title: 'One' }),
      baseProject({ title: 'Two' }),
      baseProject({ title: 'Three' }),
    ]);
    expect(frames.map((frame) => frame.gridArea)).toEqual(['c1', 'ws']);
    expect(frames.map((frame) => frame.project.title)).toEqual(['One', 'Two']);
  });
});

describe('projectFrameAspect', () => {
  it('maps layout strings to aspect keys', () => {
    expect(projectFrameAspect('wide')).toBe('wide');
    expect(projectFrameAspect('tall')).toBe('tall');
    expect(projectFrameAspect('square')).toBe('square');
    expect(projectFrameAspect(null)).toBe('square');
    expect(projectFrameAspect(undefined)).toBe('square');
    expect(projectFrameAspect('default')).toBe('square');
  });
});

describe('projectTagMeta', () => {
  it('requires both type and year', () => {
    expect(projectTagMeta({ creationDate: '2026-03-01', type: 'Website' })).toBe('Website · 2026');
    expect(projectTagMeta({ creationDate: null, type: 'Website' })).toBeNull();
    expect(projectTagMeta({ creationDate: '2026-03-01', type: null })).toBeNull();
    expect(projectTagMeta({ creationDate: null, type: null })).toBeNull();
  });

  it('uses the first type when Contentful returns an array', () => {
    expect(projectTagMeta({ creationDate: '2022-01-01', type: ['Website', 'iOS app'] })).toBe(
      'Website · 2022',
    );
  });
});
