import useData from 'api/useData';
import React from 'react';
import { FiUser } from 'react-icons/fi';
import styled from 'styled-components';
import ColorSchemeToggleCard from './ColorSchemeToggleCard';
import ContentCard from './ContentCard';
import ContentGrid from './ContentGrid';
import Image from './Image';
import Meta from './Meta';
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
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
const Homepage = () => {
  const { data: projects } = useData('projects');
  const { data: introBlock } = useData('introBlock');
  const { data: footerLinks } = useData('siteFooter');

  const introCards = introBlock?.textBlock?.content
    ? [
        <ImageCard
          key="image"
          link={footerLinks?.find((item) => item.title?.includes('LinkedIn'))}
          overlay={{
            alwaysVisible: <FiUser />,
            hiddenUntilHover: <strong>About</strong>,
          }}
        >
          <Image {...introBlock.image} alt={introBlock.image.title} layout="intrinsic" />
        </ImageCard>,
        <IntroCard key="text-content">
          <RichText {...introBlock.textBlock.content} />
        </IntroCard>,
      ]
    : [];

  const projectCards =
    projects?.map((project) => <ProjectCard key={project.title} {...project} />) ?? [];

  // Insert the statically-placed cards between the project cards at strategic positions
  const cards = [
    ...introCards,
    ...projectCards.slice(0, 2),
    <ColorSchemeToggleCard key="theme-toggle" />,
    ...projectCards.slice(2),
  ];

  // Metadata for the homepage + the content grid of cards
  const firstParagraph =
    introBlock?.textBlock.content?.json.content
      ?.find((item) => item.nodeType === 'paragraph')
      ?.content?.find((item) => item.nodeType === 'text')?.value ??
    "I'm Dylan, an engineer focused on building top-notch user experiences. I'm interested in React, sustainability, startups, music, and cycling.";
  return (
    <>
      <Meta title="Engineer. Problem Solver." description={firstParagraph} />
      <ContentGrid>{cards}</ContentGrid>
    </>
  );
};

export default Homepage;
