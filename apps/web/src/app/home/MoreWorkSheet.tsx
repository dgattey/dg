import { type CSSProperties, Fragment, type ReactNode } from 'react';
import { CutOut } from '../collage/CutOut';
import { CUT_OUT_PLACEMENTS, moreWorkOverflowPlacements } from '../collage/cutOutPlacements';
import {
  MORE_WORK_OVERFLOW_GRID_AREAS,
  type MoreWorkOverflowUnit,
  moreWorkFrames,
  moreWorkGridAreas,
  type SlottedProject,
} from '../collage/projectSlots';
import { CollageProjectFrame } from './CollageProjectFrame';

function MoreWorkGrid({
  projects,
  sites,
  overflow = false,
}: {
  overflow?: boolean;
  projects: ReadonlyArray<SlottedProject>;
  sites?: ReactNode;
}) {
  const frames = moreWorkFrames(projects);
  const byArea = new Map(frames.map((frame) => [frame.gridArea, frame]));
  const order = ['mg', 'sd', 'cn', 'js', 'gn'] as const;
  const grid = overflow
    ? { areas: MORE_WORK_OVERFLOW_GRID_AREAS, rowGapPx: 56 }
    : moreWorkGridAreas({
        cn: byArea.has('cn'),
        gn: byArea.has('gn'),
        js: byArea.has('js'),
        mg: byArea.has('mg'),
      });
  const gridStyle: CSSProperties & Record<`--${string}`, string> = {
    '--grid-areas': grid.areas,
    '--grid-row-gap': `${grid.rowGapPx}px`,
  };

  return (
    <div
      className="collageMeasure collageMeasureGrid collageGridStack home__moreWorkGrid"
      style={gridStyle}
    >
      {order.map((area) => {
        if (area === 'sd') {
          return sites ? <Fragment key="sd">{sites}</Fragment> : null;
        }
        const frame = byArea.get(area);
        if (!frame) {
          return null;
        }
        return (
          <CollageProjectFrame
            data-slot={frame.gridArea}
            key={frame.key}
            project={frame.project}
            style={frame.style}
          />
        );
      })}
    </div>
  );
}

export function MoreWorkSheet({
  overflow,
  projects,
  sites,
}: {
  overflow: ReadonlyArray<MoreWorkOverflowUnit>;
  projects: ReadonlyArray<SlottedProject>;
  sites: ReactNode;
}) {
  return (
    <section aria-label="More work" className="collageBleed home__moreWork">
      <div aria-hidden="true" className="collageField home__moreWorkField" />
      {CUT_OUT_PLACEMENTS.moreWork.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <MoreWorkGrid projects={projects} sites={sites} />
      {overflow.map((unit) => (
        <div className="home__overflow" key={unit.key}>
          {moreWorkOverflowPlacements(unit.key).map((placement) => (
            <CutOut key={placement.id} placement={placement} />
          ))}
          <MoreWorkGrid overflow projects={unit.projects} />
        </div>
      ))}
    </section>
  );
}
