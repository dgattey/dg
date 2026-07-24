import type { Project } from '../schema/shared';
import { toRenderableAsset } from './assets';

export const SIDE_PROJECTS_LIMIT = 2;

export type RenderableSideProject = {
  creationDate: string | null;
  description: string;
  mark: {
    height: number;
    title?: string | null;
    url: string;
    width: number;
  };
  title: string;
  url: string;
};

const isSafeHttpsUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Maps a flagged Contentful project into the side-projects card shape.
 * Reuses title, summary, link.url, thumbnail, and creationDate.
 */
export const toRenderableSideProject = (
  project: Project | null | undefined,
): RenderableSideProject | null => {
  if (project?.isSideProject !== true) {
    return null;
  }
  if (!project.title || !project.summary) {
    return null;
  }
  const url = project.link?.url ?? null;
  if (!url || !isSafeHttpsUrl(url)) {
    return null;
  }
  const mark = toRenderableAsset(project.thumbnail);
  if (!mark || !isSafeHttpsUrl(mark.url)) {
    return null;
  }
  return {
    creationDate: project.creationDate ?? null,
    description: project.summary,
    mark,
    title: project.title,
    url,
  };
};

/**
 * Keeps newest-first order by creationDate and caps at the homepage max.
 */
export const takeNewestSideProjects = (
  projects: ReadonlyArray<RenderableSideProject>,
  limit: number = SIDE_PROJECTS_LIMIT,
): Array<RenderableSideProject> => {
  const sorted = [...projects].sort((left, right) => {
    const leftTime = left.creationDate ? Date.parse(left.creationDate) : Number.NEGATIVE_INFINITY;
    const rightTime = right.creationDate
      ? Date.parse(right.creationDate)
      : Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });
  return sorted.slice(0, limit);
};
