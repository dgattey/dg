import { Project } from 'api/contentful/generated/api.generated';
import styled from 'styled-components';
import ContentCard from './ContentCard';
import ContentWrappingLink from './ContentWrappingLink';
import Image from './Image';
import ProjectIcon from './ProjectIcon';
import Stack from './Stack';

type Props = Project;

// A stack for the title + icon, that animates in from slightly offscreen left when hovered
const TitleStack = styled(Stack).attrs({ $alignItems: 'center', $gap: '8px' })`
  overflow: hidden;
  position: absolute;
  bottom: 0.5em;
  left: 0.5em;
  background: var(--contrast-overlay);
  color: var(--contrast-overlay-inverse);
  padding: 0.5em 0.75em;
  border-radius: 2em;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.16);

  transition: transform var(--transition);
  transform: translateX(calc(2em - 100%));
`;

// Animates "from right" and fully opaque when hovered - as it's in the stack, it appears to not move since both animate
const TitleText = styled.strong`
  white-space: nowrap;
  transition: opacity var(--transition), transform var(--transition);
  opacity: 0;
  transform-origin: right;
  transform: translateX(100%);
`;

const Card = styled(ContentCard)`
  :hover {
    ${TitleStack} {
      transform: initial;
    }
    ${TitleText} {
      opacity: 1;
      transform: initial;
    }
  }
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
    <Card verticalSpan={verticalSpan} horizontalSpan={horizontalSpan} isClickable={!!link}>
      <ContentWrappingLink link={link}>
        {thumbnail && <Image {...thumbnail} alt={title} />}
        <TitleStack>
          <TitleText>{title}</TitleText>
          <ProjectIconWithBackground type={type} />
        </TitleStack>
      </ContentWrappingLink>
    </Card>
  );
};

export default ProjectCard;
