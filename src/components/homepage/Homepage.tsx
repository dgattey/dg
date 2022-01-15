import useData from 'api/useData';
import ContentGrid from 'components/ContentGrid';
import React from 'react';
import ColorSchemeToggleCard from './ColorSchemeToggleCard';
import HomepageMeta from './HomepageMeta';
import IntroCard from './IntroCard';
import ProjectCard from './ProjectCard';

/**
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
const Homepage = () => {
  const { data: projects } = useData('projects');

  const projectCards =
    projects?.map((project) => <ProjectCard key={project.title} {...project} />) ?? [];

  // Insert the statically-placed cards between the project cards at strategic positions
  const cards = [
    <IntroCard key="intro" />,
    ...projectCards.slice(0, 2),
    <ColorSchemeToggleCard key="theme-toggle" />,
    ...projectCards.slice(2),
  ];

  return (
    <>
      <HomepageMeta />
      <ContentGrid>{cards}</ContentGrid>
    </>
  );
};

export default Homepage;
