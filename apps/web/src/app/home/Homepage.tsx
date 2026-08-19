import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { getProjects } from '../../services/contentful';
import { GatteySitesCardSlot } from './GatteySitesCardSlot';
import type { IntroCardVariant } from './IntroCard';
import { IntroCardSlot } from './IntroCardSlot';
import { MapCardSlot } from './MapCardSlot';
import { ProjectCard } from './ProjectCard';
import { SpotifyCardSlot } from './SpotifyCard';
import { StravaCardSlot } from './StravaCardSlot';

type HomepageGrid = (props: { children: React.ReactNode }) => React.ReactNode;

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
 *
 * `Grid` defaults to the rigid `ContentGrid` so flag-off `/` stays put.
 * The greenhouse homepage passes a looser grid and a composed intro.
 */
export async function Homepage({
  Grid = ContentGrid,
  introVariant = 'split',
}: {
  Grid?: HomepageGrid;
  introVariant?: IntroCardVariant;
} = {}) {
  const isGreenhouse = introVariant === 'composed';
  const projects = await getProjects().catch(() => []);
  const projectCards = projects.map((project, index) => (
    <ProjectCard
      key={project.title}
      variant={isGreenhouse && index === 0 ? 'featured' : 'media'}
      {...project}
    />
  ));

  // These cards are interleaved between the project cards at the given indices. Project cards
  // should maintain their original order, but not necessarily index.
  const preciselyPlacedCards = isGreenhouse
    ? new Map([
        [0, <IntroCardSlot key="intro" variant="composed" />],
        [1, <SpotifyCardSlot key="spotify" variant="nowPlaying" />],
        [2, <StravaCardSlot key="strava" />],
      ])
    : new Map([
        [0, <IntroCardSlot key="intro" variant={introVariant} />],
        [1, <MapCardSlot key="map" />],
        [3, <SpotifyCardSlot key="spotify" />],
        [4, <StravaCardSlot key="strava" />],
        [7, <GatteySitesCardSlot key="gattey-sites" />],
      ]);

  return <Grid>{mergeCards(projectCards, preciselyPlacedCards)}</Grid>;
}
