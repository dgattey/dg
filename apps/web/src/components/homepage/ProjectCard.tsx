import type { RenderableProject } from '@dg/content-models/contentful/renderables/projects';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { getShape } from '@dg/ui/theme/shape';

type ProjectCardProps = RenderableProject;

const { gridItemSize } = getShape();
const smallMaxHeight = gridItemSize?.(0.75);

const projectCardSx: SxObject = {
  maxHeight: { md: 'unset', xs: smallMaxHeight ?? 'unset' },
};

/**
 * Uses the `ContentCard` to show a project's details
 */
export function ProjectCard({ title, layout, link, thumbnail }: ProjectCardProps) {
  const { width, height, sizes, verticalSpan, horizontalSpan } = useCurrentImageSizes(
    layout ?? undefined,
  );

  return (
    <ContentCard
      horizontalSpan={horizontalSpan}
      link={link ?? undefined}
      overlay={title}
      sx={projectCardSx}
      verticalSpan={verticalSpan}
    >
      <Image alt={title} cover={true} height={height} sizes={sizes} url={thumbnail.url} width={width} />
    </ContentCard>
  );
}
