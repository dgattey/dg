import type { Project } from 'api/types/generated/contentfulApi.generated';
import type { Props as ContentCardProps } from 'components/ContentCard';
import ContentCard from 'components/ContentCard';
import { cardSize, cardSizeInPx } from 'components/ContentGrid';
import HoverableContainer from 'components/HoverableContainer';
import Image from 'components/Image';
import { useState } from 'react';
import styled from 'styled-components';

type Props = Project & Pick<ContentCardProps, 'turnOnAnimation'>;

// Makes sure our images take up full size of parent - this seems to be best way to do it right now
const ProjectImage = styled(Image)`
  position: fixed !important;
`;

// Ensure on mobile, all cards are uniform height (small in height)
const Card = styled(ContentCard)`
  @media (max-width: 767.99px) {
    height: ${cardSize(0.67)};
  }
`;

/**
 * Uses the `ContentCard` to show a project's details
 */
const ProjectCard = ({ title, layout, link, thumbnail, turnOnAnimation }: Props) => {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
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
          <ProjectImage
            {...thumbnail}
            alt={title}
            width={cardSizeInPx(horizontalSpan)}
            height={cardSizeInPx(verticalSpan)}
          />
        </HoverableContainer>
      )}
    </Card>
  );
};

export default ProjectCard;
