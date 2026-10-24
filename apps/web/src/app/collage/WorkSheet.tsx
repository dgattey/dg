import type { CSSProperties, ReactNode } from 'react';
import { CollageProjectFrame } from './CollageProjectFrame';
import { CutOut } from './CutOut';
import { CUT_OUT_PLACEMENTS } from './cutOutPlacements';
import { type SlottedProject, workSheetFrames, workSheetGridAreas } from './projectSlots';

export function WorkSheet({
  projects,
  spotify,
  strava,
}: {
  projects: ReadonlyArray<SlottedProject>;
  spotify: ReactNode;
  strava: ReactNode;
}) {
  const frames = workSheetFrames(projects);
  const projectOne = frames.find((frame) => frame.gridArea === 'c1');
  const projectTwo = frames.find((frame) => frame.gridArea === 'ws');
  const grid = workSheetGridAreas({
    c1: projectOne !== undefined,
    ws: projectTwo !== undefined,
  });
  const gridStyle: CSSProperties & Record<`--${string}`, string> = {
    '--grid-areas': grid.areas,
    '--grid-row-gap': `${grid.rowGapPx}px`,
  };

  return (
    <section aria-label="Work" className="collageBleed home__work">
      <div aria-hidden="true" className="collageField collageSheet-starfield home__workField" />
      {CUT_OUT_PLACEMENTS.workSheet.map((placement) => (
        <CutOut key={placement.id} placement={placement} />
      ))}
      <div
        className="collageMeasure collageMeasureGrid collageGridStack home__workGrid"
        style={gridStyle}
      >
        {projectOne ? (
          <CollageProjectFrame
            data-slot="c1"
            key={projectOne.key}
            project={projectOne.project}
            style={projectOne.style}
          />
        ) : null}
        {spotify}
        {strava}
        {projectTwo ? (
          <CollageProjectFrame
            data-slot="ws"
            key={projectTwo.key}
            project={projectTwo.project}
            style={projectTwo.style}
          />
        ) : null}
      </div>
    </section>
  );
}
