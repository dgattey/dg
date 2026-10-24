'use client';

import { ChevronDown } from 'lucide-react';
import { bindHoverMenu } from './hoverMenu';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';

/**
 * A `Year ▾` paper pill that opens a grid of years on hover or click. The pill
 * reads the picked year once there is one.
 */
export function YearMenu({
  onPick,
  onPrefetch,
  onWarmup,
  selected,
  tiltDeg = 1.5,
  years,
}: {
  onPick: (year: number) => void;
  onPrefetch?: (year: number) => void;
  /** Called when the pointer first reaches the menu, before any year is hovered. */
  onWarmup?: () => void;
  selected: number | null;
  tiltDeg?: number;
  years: ReadonlyArray<number>;
}) {
  return (
    <details
      className="chrome__music yearMenu"
      onPointerEnter={onWarmup}
      ref={(node) => bindHoverMenu(node, 'button[data-year-option]')}
    >
      <summary className="chrome__musicSummary yearMenu__summary collageLift">
        <PaperTag
          className={cx('paperPill', selected !== null && 'paperButtonCurrent')}
          edge="quad-a"
          tiltDeg={tiltDeg}
        >
          <span className="paperPillButton yearMenu__face">
            {selected ?? 'Year'}
            <ChevronDown aria-hidden={true} className="chrome__musicChevron" size={18} />
          </span>
        </PaperTag>
      </summary>
      <PaperCard
        className="chrome__musicPanel yearMenu__panel"
        edge="quad-a"
        innerClassName="chrome__musicPanelInner"
        tiltDeg={-1}
      >
        <ul aria-label="Select year" className="yearMenu__grid">
          {years.map((year) => {
            const current = selected === year;
            return (
              <li key={year}>
                <button
                  aria-pressed={current}
                  className={cx(
                    'chrome__musicLink yearMenu__option',
                    current && 'yearMenu__option--current',
                  )}
                  data-year-option={year}
                  onClick={() => onPick(year)}
                  onFocus={() => onPrefetch?.(year)}
                  onMouseEnter={() => onPrefetch?.(year)}
                  type="button"
                >
                  {year}
                </button>
              </li>
            );
          })}
        </ul>
      </PaperCard>
    </details>
  );
}
