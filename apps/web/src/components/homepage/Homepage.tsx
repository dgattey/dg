import { useData } from 'api/useData';
import { useRef } from 'react';
import { ContentGrid } from 'ui/core/ContentGrid';
import { Meta } from '../Meta';
import { HOMEPAGE_TITLE } from '../Meta.constants';
import { IntroCard } from './IntroCard';
import { MapPreviewCard } from './MapPreviewCard';
import { ProjectCard } from './ProjectCard';
import { SpotifyCard } from './SpotifyCard';
import { StravaCard } from './StravaCard';

/**
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
export function Homepage() {
  const { data: projects } = useData('projects');
  const { data: introBlock } = useData('intro');

  // Grabs the first intro block text element, essentially.
  const firstParagraph = introBlock?.textBlock.content?.json.content
    ?.find((item: { nodeType: string }) => item.nodeType === 'paragraph')
    ?.content?.find(
      (item: { nodeType: string; value?: string }) => item.nodeType === 'text',
    )?.value;

  // For animating grid items
  const gridRef = useRef<HTMLDivElement | null>(null);

  const projectCards =
    projects?.map((project) => <ProjectCard key={project.title} {...project} />) ?? [];

  // These index into projectCards to splice in other cards
  const otherCards = [
    { card: <IntroCard key="intro" />, index: 0 },
    { card: <MapPreviewCard key="map" />, index: 0 },
    { card: <SpotifyCard key="spotify" />, index: 2 },
    { card: <StravaCard key="strava" />, index: 6 },
  ];

  return (
    <>
      <Meta description={firstParagraph} title={HOMEPAGE_TITLE} />
      <ContentGrid gridRef={gridRef}>
        {otherCards.map(({ index, card }, arrayIndex) => {
          const nextItem = otherCards[arrayIndex + 1];
          return [card, ...projectCards.slice(index, nextItem?.index)];
        })}
      </ContentGrid>
    </>
  );
}
