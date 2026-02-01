import type { Project, ProjectWithSys } from '../schema/shared';
import type { RenderableLink } from './links';

export type RenderableProject = {
  title: string;
  creationDate?: string | null;
  type?: string | Array<string> | null;
  layout?: string | null;
  link?: RenderableLink | null;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  description?: { json: unknown } | null;
};

export type RenderableProjectWithSys = RenderableProject & {
  sys: {
    id: string;
  };
};

export const toRenderableProject = (
  project: Project | null | undefined,
): RenderableProject | null => {
  if (!project?.title) {
    return null;
  }
  const thumbnail = project.thumbnail;
  if (!thumbnail?.url || thumbnail.width == null || thumbnail.height == null) {
    return null;
  }
  const linkUrl = project.link?.url ?? null;
  const link = linkUrl
    ? {
        icon: null,
        title: project.title,
        url: linkUrl,
      }
    : null;
  return {
    creationDate: project.creationDate ?? null,
    description: project.description ?? null,
    layout: project.layout ?? null,
    link,
    thumbnail: {
      height: thumbnail.height,
      url: thumbnail.url,
      width: thumbnail.width,
    },
    title: project.title,
    type: project.type ?? null,
  };
};

export const toRenderableProjectWithSys = (
  project: ProjectWithSys | null | undefined,
): RenderableProjectWithSys | null => {
  const renderable = toRenderableProject(project);
  if (!renderable || !project?.sys?.id) {
    return null;
  }
  return {
    ...renderable,
    sys: { id: project.sys.id },
  };
};
