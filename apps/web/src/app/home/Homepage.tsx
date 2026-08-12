import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { interactiveRedesign } from '../../flags';
import { getProjects } from '../../services/contentful';
import { ForestHomepage } from './forest/ForestHomepage';
import { GatteySitesCardSlot } from './GatteySitesCardSlot';
import { IntroCardSlot } from './IntroCardSlot';
import { MapCardSlot } from './MapCardSlot';
import { mergeCards } from './mergeCards';
import { ProjectCard } from './ProjectCard';
import { SpotifyCardSlot } from './SpotifyCard';
import { StravaCardSlot } from './StravaCardSlot';

/**
 * Puts all projects into a grid using `projects` data,
 * interspersed with `introBlock` data, and dark/light mode
 * toggle.
 */
export async function ContentGridHomepage() {
  const projects = await getProjects();
  const projectCards = projects.map((project) => <ProjectCard key={project.title} {...project} />);

  // These cards are interleaved between the project cards at the given indices. Project cards
  // should maintain their original order, but not necessarily index.
  const preciselyPlacedCards = new Map([
    [0, <IntroCardSlot key="intro" />],
    [1, <MapCardSlot key="map" />],
    [3, <SpotifyCardSlot key="spotify" />],
    [4, <StravaCardSlot key="strava" />],
    [7, <GatteySitesCardSlot key="gattey-sites" />],
  ]);

  return <ContentGrid>{mergeCards(projectCards, preciselyPlacedCards)}</ContentGrid>;
}

/**
 * Picks the homepage layout. `interactive-redesign` swaps the card grid for a
 * walkable forest map built from the same cards; with the flag off this is the
 * grid it has always been.
 */
export async function Homepage() {
  if (await interactiveRedesign()) {
    return <ForestHomepage />;
  }
  return <ContentGridHomepage />;
}
