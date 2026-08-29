import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { getProjects } from '../../services/contentful';
import { HelloSheet } from '../collage/HelloSheet';
import { GatteySitesCardSlot } from './GatteySitesCardSlot';
import { IntroCardSlot } from './IntroCardSlot';
import { MapCardSlot } from './MapCardSlot';
import { ProjectCard } from './ProjectCard';
import { SpotifyCardSlot } from './SpotifyCard';
import { StravaCardSlot } from './StravaCardSlot';

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

export async function Homepage({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const projects = await getProjects();

  if (surface === 'collage') {
    return (
      <HelloSheet
        intro={<IntroCardSlot surface="collage" />}
        map={<MapCardSlot surface="collage" />}
      />
    );
  }

  const projectCards = projects.map((project) => <ProjectCard key={project.title} {...project} />);

  const preciselyPlacedCards = new Map([
    [0, <IntroCardSlot key="intro" surface="classic" />],
    [1, <MapCardSlot key="map" surface="classic" />],
    [3, <SpotifyCardSlot key="spotify" />],
    [4, <StravaCardSlot key="strava" />],
    [7, <GatteySitesCardSlot key="gattey-sites" />],
  ]);

  return <ContentGrid>{mergeCards(projectCards, preciselyPlacedCards)}</ContentGrid>;
}
