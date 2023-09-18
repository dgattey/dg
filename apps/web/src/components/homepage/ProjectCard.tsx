import { useState } from 'react';
import type { Project } from 'api/types/generated/contentfulApi.generated';
import type { ContentCardProps } from 'components/ContentCard';
import { ContentCard } from 'components/ContentCard';
import { HoverableContainer } from 'components/HoverableContainer';
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
      horizontalSpan={horizontalSpan}
      link={link}
      onMouseOut={() => {
        setIsHovered(false);
      }}
      onMouseOver={() => {
        setIsHovered(true);
      }}
      overlay={title}
      sx={(theme) => ({
        [theme.breakpoints.down('md')]: {
          maxHeight: theme.shape.gridItemSize(0.75),
        },
      })}
      turnOnAnimation={turnOnAnimation}
      verticalSpan={verticalSpan}
    >
      {thumbnail ? (
        <HoverableContainer isHovered={isHovered}>
          <Image
            alt={title ?? 'Project image'}
            height={height}
            sizes={sizes}
            url={thumbnail.url}
            width={width}
          />
        </HoverableContainer>
      ) : null}
    </ContentCard>
  );
}
