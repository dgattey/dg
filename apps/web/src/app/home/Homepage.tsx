import 'server-only';

import {
  getIntroContent,
  getLinkByName,
  getProjects,
  getSideProjects,
} from '../../services/contentful';
import { getLastKnownSong } from '../../services/spotify';
import { getStravaHistory } from '../../services/strava';
import { CutOut } from '../collage/CutOut';
import { CUT_OUT_PLACEMENTS } from '../collage/cutOutPlacements';
import { assignProjectSlots, CODA_FRAME_STYLE } from '../collage/projectSlots';
import { SpotifyCollageCard } from '../spotify/SpotifyCollageCard';
import { CollageProjectFrame } from './CollageProjectFrame';
import { GatteySitesCard } from './GatteySitesCard';
import { IntroCard } from './IntroCard';
import { MapCardSlot } from './MapCardSlot';
import { MoreWorkSheet } from './MoreWorkSheet';
import { StravaCard } from './StravaCard';
import { WorkSheet } from './WorkSheet';

async function IntroCardSlot() {
  const [introBlock, linkedInLink] = await Promise.all([
    getIntroContent(),
    getLinkByName('LinkedIn'),
  ]);
  if (!introBlock) {
    return null;
  }
  return <IntroCard introBlock={introBlock} linkedInLink={linkedInLink} />;
}

async function SpotifyCardSlot() {
  return <SpotifyCollageCard track={await getLastKnownSong()} />;
}

async function StravaCardSlot() {
  return <StravaCard history={await getStravaHistory()} />;
}

async function GatteySitesCardSlot() {
  const projects = await getSideProjects();
  return projects.length > 0 ? <GatteySitesCard projects={projects} /> : null;
}

export async function Homepage() {
  const projects = await getProjects();
  const slots = assignProjectSlots(projects);

  return (
    <>
      <section aria-label="Hello" className="collageBleed home__hello">
        {CUT_OUT_PLACEMENTS.helloSheet.map((placement) => (
          <CutOut key={placement.id} placement={placement} />
        ))}
        <div className="collageMeasure collageMeasureGrid collageGridStack home__helloGrid">
          <IntroCardSlot />
          <MapCardSlot />
        </div>
      </section>
      <WorkSheet projects={slots.work} spotify={<SpotifyCardSlot />} strava={<StravaCardSlot />} />
      <MoreWorkSheet
        overflow={slots.overflow}
        projects={slots.moreWork}
        sites={<GatteySitesCardSlot />}
      />
      {slots.coda ? (
        <section aria-label="And" className="collageBleed home__coda">
          {CUT_OUT_PLACEMENTS.coda.map((placement) => (
            <CutOut key={placement.id} placement={placement} />
          ))}
          <div className="collageMeasure collageMeasureGrid collageGridStack home__codaGrid">
            <CollageProjectFrame
              data-slot="li"
              key={slots.coda.key}
              project={slots.coda.project}
              style={CODA_FRAME_STYLE}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
