import useData from '@dg/api/useData';
import ContentGrid from '@dg/components/ContentGrid';
import Meta from '@dg/components/Meta';
import useGridAnimation from '@dg/hooks/useGridAnimation';
import type { Page } from '@dg/types/Page';
import { useMemo, useRef } from 'react';
import ColorSchemeToggleCard from './ColorSchemeToggleCard';
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
const Homepage = ({ pageUrl }: Pick<Page, 'pageUrl'>) => {
  const { data: projects } = useData('projects');
  const { data: introBlock } = useData('intro');

  // Grabs the first intro block text element, essentially.
  const firstParagraph = introBlock?.textBlock?.content?.json.content
    ?.find((item) => item.nodeType === 'paragraph')
    ?.content?.find((item) => item.nodeType === 'text')?.value;

  // For animating grid items
  const gridRef = useRef<HTMLDivElement | null>(null);
  const turnOnAnimation = useGridAnimation(gridRef);

  const projectCards =
    projects?.map((project) => (
      <ProjectCard key={project.title} {...project} turnOnAnimation={turnOnAnimation} />
    )) ?? [];

  // These index into projectCards to splice in other cards
  const otherCards = useMemo(
    () => [
      { index: 0, card: <IntroCard key="intro" /> },
      { index: 0, card: <MapCard key="map" turnOnAnimation={turnOnAnimation} /> },
      { index: 2, card: <SpotifyCard key="spotify" /> },
      { index: 3, card: <ColorSchemeToggleCard key="color" /> },
      { index: 6, card: <StravaCard key="strava" /> },
    ],
    [turnOnAnimation],
  );

  return (
    <>
      <Meta pageUrl={pageUrl} title="Engineer. Problem Solver." description={firstParagraph} />
      <ContentGrid gridRef={gridRef}>
        {otherCards.map(({ index, card }, arrayIndex) => {
          const nextItem = otherCards[arrayIndex + 1];
          return [card, ...projectCards.slice(index, nextItem?.index)];
        })}
      </ContentGrid>
    </>
  );
};

export default Homepage;
