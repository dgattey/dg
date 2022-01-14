import useData from 'api/useData';
import React from 'react';
import ContentGrid from './ContentGrid';
import ProjectCard from './ProjectCard';

/**
 * Puts all projects into a grid using `projects` data
 */
const ProjectGrid = () => {
  const { data: projects } = useData('projects');
  return (
    <ContentGrid>
      {projects?.map((project) => (
        <ProjectCard key={project.title} {...project} />
      ))}
    </ContentGrid>
  );
};

export default ProjectGrid;
