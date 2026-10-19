import { getProjects } from '../../services/contentful';
import { CollageProjectFrame } from '../collage/CollageProjectFrame';
import { CutOut } from '../collage/CutOut';
import { CutOutSymbols } from '../collage/CutOutSymbols';
import { CUT_OUT_PLACEMENTS } from '../collage/cutOutPlacements';
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
import { SpotifyCardSlot } from './SpotifyCard';
import { StravaCardSlot } from './StravaCardSlot';

export async function Homepage() {
  const projects = await getProjects();
  const slots = assignProjectSlots(projects);

  return (
    <>
      <CutOutSymbols />
      <section aria-label="Hello" className="collageBleed home__hello">
        {CUT_OUT_PLACEMENTS.helloSheet.map((placement) => (
          <CutOut key={placement.id} placement={placement} />
        ))}
        <div
          className="collageMeasure collageMeasureGrid collageGridStack home__helloGrid"
          style={{ gridTemplateAreas: HELLO_GRID_AREAS }}
        >
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
          <div
            className="collageMeasure collageMeasureGrid collageGridStack home__codaGrid"
            style={{ gridTemplateAreas: CODA_GRID_AREAS }}
          >
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
