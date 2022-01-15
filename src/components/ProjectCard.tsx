import { Project } from 'api/contentful/generated/api.generated';
import styled from 'styled-components';
import ContentCard from './ContentCard';
import Image from './Image';
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

  return (
    <ContentCard
      verticalSpan={verticalSpan}
      horizontalSpan={horizontalSpan}
      isClickable={!!link}
      overlay={{
        alwaysVisible: <ProjectIconWithBackground type={type} />,
        hiddenUntilHover: <TitleText>{title}</TitleText>,
      }}
    >
      {thumbnail && <Image {...thumbnail} alt={title} />}
    </ContentCard>
  );
};

export default ProjectCard;
