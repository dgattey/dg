import { Project } from 'api/contentful/generated/api.generated';
import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import ContentCard from './ContentCard';

type Props = Project;

const Title = styled.a`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: black;
`;

/**
 * Uses the `ContentCard` to show a project's details
 */
const ProjectCard = ({ title, layout, link, thumbnail }: Props) => {
  const verticalSpan = layout === 'tall' ? 2 : 1;
  const horizontalSpan = layout === 'wide' ? 2 : 1;
  return (
    <ContentCard verticalSpan={verticalSpan} horizontalSpan={horizontalSpan} isClickable={!!link}>
      <Image
        src={thumbnail?.url}
        alt={title}
        layout="responsive"
        width={thumbnail?.width}
        height={thumbnail?.height}
      />
      {link?.url && (
        <Link passHref href={link.url}>
          <Title>{title}</Title>
        </Link>
      )}
    </ContentCard>
  );
};

export default ProjectCard;
