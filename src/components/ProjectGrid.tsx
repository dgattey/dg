import useData from 'api/useData';
import React from 'react';
import styled from 'styled-components';
import ContentCard from './ContentCard';
import ContentGrid from './ContentGrid';
import Image from './Image';
import ProjectCard from './ProjectCard';
import RichText from './RichText';

const ImageCard = styled(ContentCard)`
  display: none;
  @media (min-width: 768px) {
    display: flex;
  }
`;

const IntroCard = styled(ContentCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  & h1 {
    --typography-spacing-vertical: 1.5rem;
  }
  & p {
    font-size: 0.9em;
  }
  background: none;
  border: none;
  box-shadow: none;
`;

/**
 * Puts all projects into a grid using `projects` data
 */
const ProjectGrid = () => {
  const { data: projects } = useData('projects');
  const { data: introBlock } = useData('introBlock');
  return (
    <ContentGrid>
      {introBlock?.textBlock?.content && (
        <>
          <ImageCard>
            <Image {...introBlock.image} alt={introBlock.image.title} layout="fill" />
          </ImageCard>
          <IntroCard>
            <RichText {...introBlock.textBlock.content} />
          </IntroCard>
        </>
      )}
      {projects?.map((project) => (
        <ProjectCard key={project.title} {...project} />
      ))}
    </ContentGrid>
  );
};

export default ProjectGrid;
