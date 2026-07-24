import { toRenderableAsset } from './assets';
import type { SideProject } from '../schema/sideProjects';

export const SIDE_PROJECTS_LIMIT = 2;

export type RenderableSideProject = {
  description: string;
  mark: {
    height: number;
    title?: string | null;
    url: string;
    width: number;
  };
  publishedAt: string | null;
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
 * Maps a Contentful side project into a UI-safe shape.
 * Drops entries missing required fields or with non-https URLs/assets.
 */
export const toRenderableSideProject = (
  project: SideProject | null | undefined,
): RenderableSideProject | null => {
  if (!project?.title || !project.description || !project.url) {
    return null;
  }
  if (!isSafeHttpsUrl(project.url)) {
    return null;
  }
  const mark = toRenderableAsset(project.mark);
  if (!mark || !isSafeHttpsUrl(mark.url)) {
    return null;
  }
  return {
    description: project.description,
    mark,
    publishedAt: project.publishedAt ?? null,
    title: project.title,
    url: project.url,
  };
};

/**
 * Keeps newest-first order and caps at the homepage max.
 * Assumes input is already ordered by publishedAt descending when present.
 */
export const takeNewestSideProjects = (
  projects: ReadonlyArray<RenderableSideProject>,
  limit: number = SIDE_PROJECTS_LIMIT,
): Array<RenderableSideProject> => {
  const sorted = [...projects].sort((left, right) => {
    const leftTime = left.publishedAt ? Date.parse(left.publishedAt) : Number.NEGATIVE_INFINITY;
    const rightTime = right.publishedAt ? Date.parse(right.publishedAt) : Number.NEGATIVE_INFINITY;
    return rightTime - leftTime;
  });
  return sorted.slice(0, limit);
};
