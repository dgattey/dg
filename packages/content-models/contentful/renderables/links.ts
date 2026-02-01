import type { Link, LinkWithSys } from '../schema/shared';

export type RenderableLink = {
  title: string;
  url: string;
  icon?: string | null;
};

export type RenderableLinkWithSys = RenderableLink & {
  sys: {
    id: string;
  };
};

export const toRenderableLink = (link: Link | null | undefined): RenderableLink | null => {
  if (!link?.title || !link.url) {
    return null;
  }
  return {
    icon: link.icon ?? null,
    title: link.title,
    url: link.url,
  };
};

export const toRenderableLinkWithSys = (
  link: LinkWithSys | null | undefined,
): RenderableLinkWithSys | null => {
  const renderable = toRenderableLink(link);
  if (!renderable || !link?.sys?.id) {
    return null;
  }
  return {
    ...renderable,
    sys: { id: link.sys.id },
  };
};
