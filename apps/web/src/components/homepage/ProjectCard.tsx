import type { Project } from '@dg/services/contentful/api.generated';
import { ContentCard } from '@dg/ui/dependent/ContentCard';
import { Image } from '@dg/ui/dependent/Image';
import { useCurrentImageSizes } from '@dg/ui/helpers/useCurrentImageSizes';
import type { SxObject } from '@dg/ui/theme';
import { getShape } from '@dg/ui/theme/shape';

type ProjectCardProps = Project;

const { gridItemSize } = getShape();
const smallMaxHeight = gridItemSize?.(0.75);

const projectCardSx: SxObject = {
  maxHeight: { md: 'unset', xs: smallMaxHeight ?? 'unset' },
};

/**
 * Uses the `ContentCard` to show a project's details
 */
export function ProjectCard({ title, layout, link, thumbnail }: ProjectCardProps) {
  const { width, height, sizes, verticalSpan, horizontalSpan } = useCurrentImageSizes(layout);

  return (
    <ContentCard
      horizontalSpan={horizontalSpan}
      link={link}
      overlay={title}
      sx={projectCardSx}
      verticalSpan={verticalSpan}
    >
      {thumbnail ? (
        <Image
          alt={title ?? 'Project image'}
          height={height}
          sizes={sizes}
          url={thumbnail.url}
          width={width}
        />
      ) : null}
    </ContentCard>
  );
}
