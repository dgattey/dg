import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { getProjects } from '../../services/contentful';
import { CutOut } from '../collage/CutOut';
import { CutOutSymbols } from '../collage/CutOutSymbols';
import { CUT_OUT_PLACEMENTS } from '../collage/cutOutPlacements';
import styles from '../collage/home.classes';
import { MoreWorkSheet } from '../collage/MoreWorkSheet';
import {
  assignProjectSlots,
  CODA_FRAME_STYLE,
  CODA_GRID_AREAS,
  HELLO_GRID_AREAS,
} from '../collage/projectSlots';
import { WorkSheet } from '../collage/WorkSheet';
import { GatteySitesCardSlot } from './GatteySitesCardSlot';
import { IntroCardSlot } from './IntroCardSlot';
import { MapCardSlot } from './MapCardSlot';
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
export async function Homepage({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const projects = await getProjects();

  if (surface === 'collage') {
    const slots = assignProjectSlots(projects);
    return (
      <>
        <CutOutSymbols />
        <section aria-label="Hello" className={`collageBleed ${styles.hello}`}>
          {CUT_OUT_PLACEMENTS.helloSheet.map((placement) => (
            <CutOut key={placement.id} placement={placement} />
          ))}
          <div
            className={`collageMeasure collageMeasureGrid collageGridStack ${styles.helloGrid}`}
            style={{ gridTemplateAreas: HELLO_GRID_AREAS }}
          >
            <IntroCardSlot surface="collage" />
            <MapCardSlot surface="collage" />
          </div>
        </section>
        <WorkSheet
          projects={slots.work}
          spotify={<SpotifyCardSlot surface="collage" />}
          strava={<StravaCardSlot surface="collage" />}
        />
        <MoreWorkSheet
          overflow={slots.overflow}
          projects={slots.moreWork}
          sites={<GatteySitesCardSlot surface="collage" />}
        />
        {slots.coda ? (
          <section aria-label="And" className={`collageBleed ${styles.coda}`}>
            {CUT_OUT_PLACEMENTS.coda.map((placement) => (
              <CutOut key={placement.id} placement={placement} />
            ))}
            <div
              className={`collageMeasure collageMeasureGrid collageGridStack ${styles.codaGrid}`}
              style={{ gridTemplateAreas: CODA_GRID_AREAS }}
            >
              <ProjectCard
                {...slots.coda.project}
                data-slot="li"
                key={slots.coda.key}
                style={CODA_FRAME_STYLE}
                surface="collage"
              />
            </div>
          </section>
        ) : null}
      </>
    );
  }

  const projectCards = projects.map((project) => <ProjectCard key={project.title} {...project} />);

  // These cards are interleaved between the project cards at the given indices. Project cards
  // should maintain their original order, but not necessarily index.
  const preciselyPlacedCards = new Map([
    [0, <IntroCardSlot key="intro" surface="classic" />],
    [1, <MapCardSlot key="map" surface="classic" />],
    [3, <SpotifyCardSlot key="spotify" />],
    [4, <StravaCardSlot key="strava" />],
    [7, <GatteySitesCardSlot key="gattey-sites" />],
  ]);

  return <ContentGrid>{mergeCards(projectCards, preciselyPlacedCards)}</ContentGrid>;
}
