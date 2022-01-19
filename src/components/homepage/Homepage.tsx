import useData from 'api/useData';
import ContentGrid from 'components/ContentGrid';
import React, { useEffect, useMemo, useState } from 'react';
import useResizeAware from 'react-resize-aware';
import ColorSchemeToggleCard from './ColorSchemeToggleCard';
import HomepageMeta from './HomepageMeta';
import IntroCard from './IntroCard';
import MapCard from './MapCard';
import ProjectCard from './ProjectCard';

/**
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
const Homepage = () => {
  const { data: projects } = useData('projects');
  const [resizer, size] = useResizeAware();
  const [staticSize, setStaticSize] = useState<typeof size>({ width: null, height: null });

  // Ensures we only set the static size once so we don't stutter horribly on window resize as the brower tries to repaint the map canvas
  useEffect(() => {
    if (!staticSize.width && !staticSize.height) {
      setStaticSize(size);
    }
  }, [size, staticSize.height, staticSize.width]);

  const projectCards =
    projects?.map((project) => <ProjectCard key={project.title} {...project} />) ?? [];

  // These index into projectCards to splice in other cards
  const otherCards = useMemo(
    () => [
      { index: 0, card: <IntroCard key="intro" /> },
      { index: 2, card: <ColorSchemeToggleCard key="color" /> },
      { index: 3, card: <MapCard key="map" gridWidth={staticSize.width} /> },
    ],
    [staticSize.width],
  );

  return (
    <>
      <HomepageMeta />
      <ContentGrid>
        {resizer}
        {otherCards.map(({ index, card }, arrayIndex) => {
          const nextItem = otherCards[arrayIndex + 1];
          return [card, ...projectCards.slice(index, nextItem?.index)];
        })}
      </ContentGrid>
    </>
  );
};

export default Homepage;
