import type { SiteSurface } from '@dg/shared-core/siteSurface';
import { ContentGrid } from '@dg/ui/core/ContentGrid';
import { getProjects } from '../../services/contentful';
import codaStyles from '../collage/CodaSheet.module.css';
import { CutOut } from '../collage/CutOut';
import { CutOutSymbols } from '../collage/CutOutSymbols';
import { CUT_OUT_PLACEMENTS } from '../collage/cutOutPlacements';
import styles from '../collage/HelloSheet.module.css';
import { MoreWorkSheet } from '../collage/MoreWorkSheet';
import { assignProjectSlots, type ProjectFrameStyle } from '../collage/projectSlots';
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

const CODA_FRAME_STYLE: ProjectFrameStyle = {
  edge: 'quad-b',
  printTone: 'var(--cerulean)',
  tagClassName: 'tagBottomLeft',
  tagTiltDeg: 3,
  tagTone: 'rose',
  tiltDeg: -1.4,
};

export async function Homepage({ surface = 'classic' }: { surface?: SiteSurface } = {}) {
  const projects = await getProjects();

  if (surface === 'collage') {
    const slots = assignProjectSlots(projects);
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
          <section aria-label="And" className={codaStyles.sheet}>
            {CUT_OUT_PLACEMENTS.coda.map((placement) => (
              <CutOut key={placement.id} placement={placement} />
            ))}
            <div className={codaStyles.grid}>
              <ProjectCard
                {...slots.coda.project}
                className={codaStyles.project}
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

  const preciselyPlacedCards = new Map([
    [0, <IntroCardSlot key="intro" surface="classic" />],
    [1, <MapCardSlot key="map" surface="classic" />],
    [3, <SpotifyCardSlot key="spotify" />],
    [4, <StravaCardSlot key="strava" />],
    [7, <GatteySitesCardSlot key="gattey-sites" />],
  ]);

  return <ContentGrid>{mergeCards(projectCards, preciselyPlacedCards)}</ContentGrid>;
}
