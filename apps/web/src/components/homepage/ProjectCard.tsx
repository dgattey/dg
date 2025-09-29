import type { Project } from 'api/contentful/api.generated';
import { ContentCard } from 'ui/dependent/ContentCard';
import { Image } from 'ui/dependent/Image';
import { useCurrentImageSizes } from 'ui/helpers/useCurrentImageSizes';

type ProjectCardProps = Project;

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
      sx={(theme) => ({
        [theme.breakpoints.down('md')]: {
          maxHeight: theme.shape.gridItemSize(0.75),
        },
      })}
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
