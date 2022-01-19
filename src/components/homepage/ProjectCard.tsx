import { Project } from 'api/contentful/generated/api.generated';
import ContentCard from 'components/ContentCard';
import HoverableContainer from 'components/HoverableContainer';
import Image from 'components/Image';
import { useState } from 'react';
import styled from 'styled-components';
import ProjectIcon from './ProjectIcon';

type Props = Project;

const TitleText = styled.strong`
  white-space: nowrap;
`;

// Adds a background and moves it to its own layer so it covers the text as it animates
const ProjectIconWithBackground = styled(ProjectIcon)`
  background: var(--contrast-overlay);
  z-index: 1;
`;

/**
 * Uses the `ContentCard` to show a project's details
 */
const ProjectCard = ({ title, layout, link, thumbnail, type }: Props) => {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <ContentCard
      verticalSpan={verticalSpan}
      horizontalSpan={horizontalSpan}
      link={link}
      overlay={{
        alwaysVisible: <ProjectIconWithBackground type={type} />,
        hiddenUntilHover: <TitleText>{title}</TitleText>,
      }}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {thumbnail && (
        <HoverableContainer isHovered={isHovered}>
          <Image {...thumbnail} alt={title} />
        </HoverableContainer>
      )}
    </ContentCard>
  );
};

export default ProjectCard;
