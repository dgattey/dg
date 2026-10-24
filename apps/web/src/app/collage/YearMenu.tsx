'use client';

import { PillMenu, PillMenuOption } from './PillMenu';
import { cx } from './paperVars';

type YearPicks = {
  onPick: (year: number) => void;
  onPrefetch?: (year: number) => void;
  selected: number | null;
  years: ReadonlyArray<number>;
};

/** Years as a three-across grid of picks inside a `PillMenu` panel. */
export function YearGrid({ onPick, onPrefetch, selected, years }: YearPicks) {
  return (
    <ul aria-label="Select year" className="yearMenu__grid">
      {years.map((year) => (
        <li key={year}>
          <PillMenuOption
            className="yearMenu__option"
            current={selected === year}
            onPick={() => onPick(year)}
            onPrefetch={onPrefetch ? () => onPrefetch(year) : undefined}
          >
            {year}
          </PillMenuOption>
        </li>
      ))}
    </ul>
  );
}

/** A `Year ▾` paper pill over a grid of years. The pill reads the picked year once there is one. */
export function YearMenu({
  className,
  onWarmup,
  tiltDeg,
  ...picks
}: YearPicks & {
  className?: string;
  onWarmup?: () => void;
  tiltDeg?: number;
}) {
  return (
    <PillMenu
      className={cx('yearMenu', className)}
      current={picks.selected !== null}
      face={picks.selected ?? 'Year'}
      onWarmup={onWarmup}
      panelClassName="yearMenu__panel"
      tiltDeg={tiltDeg}
    >
      <YearGrid {...picks} />
    </PillMenu>
  );
}
