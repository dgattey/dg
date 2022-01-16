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
    if (staticSize.width || staticSize.height) {
      return;
    }
    setStaticSize(size);
  }, [size, staticSize.height, staticSize.width]);

  const projectCards =
    projects?.map((project) => <ProjectCard key={project.title} {...project} />) ?? [];

  // Memoized on width so we save on rerenders
  const mapCard = useMemo(
    () => <MapCard key="map" gridWidth={staticSize.width} />,
    [staticSize.width],
  );

  /**
   * Represents indexes in the project cards where other data appears
   */
  const otherCards = useMemo(
    () =>
      [
        { index: 0, element: <IntroCard key="intro" /> },
        { index: 2, element: <ColorSchemeToggleCard key="color" /> },
        { index: 3, element: mapCard },
      ] as const,
    [mapCard],
  );

  return (
    <>
      <HomepageMeta />
      <ContentGrid>
        {resizer}
        {otherCards.map(({ index, element }, arrayIndex) => {
          // Puts in the element and adds on project cards from that array index until the next one
          const nextItem = otherCards[arrayIndex + 1];
          return [element, ...projectCards.slice(index, nextItem?.index)];
        })}
      </ContentGrid>
    </>
  );
};

export default Homepage;
