import { Project } from 'api/contentful/generated/api.generated';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import ContentCard from './ContentCard';

type Props = Project;

const Title = styled.strong`
  position: absolute;
  bottom: 0.5em;
  left: 0.5em;
  transition: transform var(--transition);
  transform: translateY(150%);
  background: var(--primary);
  color: var(--primary-inverse);
  padding: 0.5em 1em;
  border-radius: 2em;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(0, 0, 0, 0.16);
`;

const Card = styled(ContentCard)`
  :hover {
    ${Title} {
      transform: initial;
    }
  }
`;

/**
 * Uses the `ContentCard` to show a project's details
 */
const ProjectCard = ({ title, layout, link, thumbnail }: Props) => {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  if (!link?.url) {
    return null;
  }
  return (
    <Link passHref href={link.url}>
      <Card verticalSpan={verticalSpan} horizontalSpan={horizontalSpan} isClickable={!!link}>
        <a href={link.url}>
          <Image
            src={thumbnail?.url}
            alt={title}
            layout="responsive"
            width={thumbnail?.width}
            height={thumbnail?.height}
          />
          <Title>{title}</Title>
        </a>
      </Card>
    </Link>
  );
};

export default ProjectCard;
