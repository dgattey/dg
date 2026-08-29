import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { getProjects } from '../../services/contentful';
import { CutOut } from '../collage/CutOut';
import { CutOutSymbols } from '../collage/CutOutSymbols';
import { CUT_OUT_PLACEMENTS } from '../collage/cutOutPlacements';
import styles from '../collage/HelloSheet.module.css';
import { WorkSheet } from '../collage/WorkSheet';
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
      <>
        <CutOutSymbols />
        <section aria-label="Hello" className={styles.sheet}>
          {CUT_OUT_PLACEMENTS.helloSheet.map((placement) => (
            <CutOut key={placement.id} placement={placement} />
          ))}
          <div className={styles.grid}>
            <IntroCardSlot surface="collage" />
            <MapCardSlot surface="collage" />
          </div>
        </section>
        <WorkSheet
          projects={projects}
          spotify={<SpotifyCardSlot surface="collage" />}
          strava={<StravaCardSlot surface="collage" />}
        />
      </>
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
