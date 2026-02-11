import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { getProjects } from '../../services/contentful';
import { IntroCardSlot } from './IntroCardSlot';
import { MapPreviewCardSlot } from './MapPreviewCardSlot';
import { ProjectCard } from './ProjectCard';
import { SpotifyCardSlot } from './SpotifyCard';
import { StravaCardSlot } from './StravaCardSlot';

/**
 * Merges the projects and other cards into a single array, where the other cards
 * are interleaved between the project cards at the given indices.
 */
function mergeCards(
  projects: Array<React.ReactNode>,
  preciselyPlacedCards: Map<number, React.ReactNode>,
): Array<React.ReactNode> {
  const projectsIterator = projects.values();
  return Array.from(
    { length: projects.length + preciselyPlacedCards.size },
    (_, i) => preciselyPlacedCards.get(i) ?? projectsIterator.next().value,
  );
}

/**
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
export async function Homepage() {
  const projects = await getProjects();
  const projectCards = projects.map((project) => <ProjectCard key={project.title} {...project} />);

  // These cards are interleaved between the project cards at the given indices. Project cards
  // should maintain their original order, but not necessarily index.
  const preciselyPlacedCards = new Map([
    [0, <IntroCardSlot key="intro" />],
    [1, <MapPreviewCardSlot key="map" />],
    [3, <SpotifyCardSlot key="spotify" />],
    [4, <StravaCardSlot key="strava" />],
  ]);

  return <ContentGrid>{mergeCards(projectCards, preciselyPlacedCards)}</ContentGrid>;
}
