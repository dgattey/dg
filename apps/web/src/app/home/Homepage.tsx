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
 * The greenhouse homepage keeps every flag-off slot: intro, now playing,
 * activity, every project, the location map, and side projects.
 */
export async function Homepage({
  Grid = ContentGrid,
  introVariant = 'split',
}: {
  Grid?: HomepageGrid;
  introVariant?: IntroCardVariant;
} = {}) {
  const projects = await getProjects().catch(() => []);

  if (introVariant === 'composed') {
    const [featured, ...rest] = projects;
    return (
      <Grid>
        <IntroCardSlot key="intro" variant="composed" />
        <SpotifyCardSlot key="spotify" variant="nowPlaying" />
        <StravaCardSlot key="strava" typeScale="greenhouse" />
        {featured ? (
          <ProjectCard
            eyebrow="Featured project"
            key={featured.title}
            variant="featured"
            {...featured}
          />
        ) : null}
        {rest.map((project) => (
          <ProjectCard eyebrow="Project" key={project.title} variant="tile" {...project} />
        ))}
        <MapCardSlot key="map" variant="location" />
        <GatteySitesCardSlot key="gattey-sites" variant="rows" />
      </Grid>
    );
  }

  const projectCards = projects.map((project) => <ProjectCard key={project.title} {...project} />);

  // These cards are interleaved between the project cards at the given indices. Project cards
  // should maintain their original order, but not necessarily index.
  const preciselyPlacedCards = new Map([
    [0, <IntroCardSlot key="intro" variant={introVariant} />],
    [1, <MapCardSlot key="map" />],
    [3, <SpotifyCardSlot key="spotify" />],
    [4, <StravaCardSlot key="strava" />],
    [7, <GatteySitesCardSlot key="gattey-sites" />],
  ]);

  return <Grid>{mergeCards(projectCards, preciselyPlacedCards)}</Grid>;
}
