import type { Project } from 'api/types/generated/contentfulApi.generated';
import type { ContentCardProps } from 'components/ContentCard';
import { ContentCard } from 'components/ContentCard';
import { HoverableContainer } from 'components/HoverableContainer';
import { useState } from 'react';
import { Image } from 'components/Image';
import { useCurrentImageSizes } from 'hooks/useCurrentImageSizes';

type ProjectCardProps = Project & Pick<ContentCardProps, 'turnOnAnimation'>;

/**
 * Uses the `ContentCard` to show a project's details
 */
export function ProjectCard({ title, layout, link, thumbnail, turnOnAnimation }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { width, height, sizes, verticalSpan, horizontalSpan } = useCurrentImageSizes(layout);

  return (
    <ContentCard
      verticalSpan={verticalSpan}
      horizontalSpan={horizontalSpan}
      link={link}
      overlay={title}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      turnOnAnimation={turnOnAnimation}
      sx={(theme) => ({
        [theme.breakpoints.down('md')]: {
          maxHeight: theme.shape.gridItemSize(0.75),
        },
      })}
    >
      {thumbnail && (
        <HoverableContainer isHovered={isHovered}>
          <Image
            url={thumbnail.url}
            width={width}
            height={height}
            alt={title ?? 'Project image'}
            sizes={sizes}
          />
        </HoverableContainer>
      )}
    </ContentCard>
  );
}
