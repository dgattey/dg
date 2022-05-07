import type { Project } from 'api/types/generated/contentfulApi.generated';
import type { Props as ContentCardProps } from 'components/ContentCard';
import ContentCard from 'components/ContentCard';
import { cardSizeInPx } from 'components/ContentGrid';
import HoverableContainer from 'components/HoverableContainer';
import Image from 'components/Image';
import { useState } from 'react';

type Props = Project & Pick<ContentCardProps, 'turnOnAnimation'>;

/**
 * Uses the `ContentCard` to show a project's details
 */
const ProjectCard = ({ title, layout, link, thumbnail, turnOnAnimation }: Props) => {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ContentCard
      verticalSpan={verticalSpan}
      horizontalSpan={horizontalSpan}
      link={link}
      overlay={title}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      turnOnAnimation={turnOnAnimation}
    >
      {thumbnail && (
        <HoverableContainer isHovered={isHovered}>
          <Image
            {...thumbnail}
            alt={title}
            width={cardSizeInPx(horizontalSpan)}
            height={cardSizeInPx(verticalSpan)}
          />
        </HoverableContainer>
      )}
    </ContentCard>
  );
};

export default ProjectCard;
