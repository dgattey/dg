import useData from 'api/useData';
import ContentGrid from 'components/ContentGrid';
import React, { useMemo } from 'react';
import ColorSchemeToggleCard from './ColorSchemeToggleCard';
import HomepageMeta from './HomepageMeta';
import IntroCard from './IntroCard';
import MapCard from './MapCard';
import ProjectCard from './ProjectCard';
import SpotifyCard from './SpotifyCard';
import StravaCard from './StravaCard';

/**
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
const Homepage = () => {
  const { data: projects } = useData('projects');

  const projectCards =
    projects?.map((project) => <ProjectCard key={project.title} {...project} />) ?? [];

  // These index into projectCards to splice in other cards
  const otherCards = useMemo(
    () => [
      { index: 0, card: <IntroCard key="intro" /> },
      { index: 0, card: <MapCard key="map" /> },
      { index: 2, card: <SpotifyCard key="spotify" /> },
      { index: 3, card: <ColorSchemeToggleCard key="color" /> },
      { index: 6, card: <StravaCard key="strava" /> },
    ],
    [],
  );

  return (
    <>
      <HomepageMeta />
      <ContentGrid>
        {otherCards.map(({ index, card }, arrayIndex) => {
          const nextItem = otherCards[arrayIndex + 1];
          return [card, ...projectCards.slice(index, nextItem?.index)];
        })}
      </ContentGrid>
    </>
  );
};

export default Homepage;
