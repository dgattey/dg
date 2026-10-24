'use client';

import type { StatsRangeKey } from '@dg/services/spotify/fetchListeningStats';
import { musicStatsRoute } from '@dg/shared-core/routes/app';
import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { PaperTag } from '../../collage/PaperTag';
import { cx } from '../../collage/paperVars';
import { YearMenu } from '../../collage/YearMenu';
import { MusicNav } from '../MusicNav';

type QuickRangeKey = 'all' | 'month' | 'week';

const QUICK_RANGE_OPTIONS: ReadonlyArray<{
  key: QuickRangeKey;
  label: string;
  tiltDeg: number;
}> = [
  { key: 'all', label: 'All time', tiltDeg: -1.4 },
  { key: 'week', label: 'This week', tiltDeg: 1.2 },
  { key: 'month', label: 'This month', tiltDeg: -0.9 },
];

export function StatsToolbar({
  availableYears,
  onPrefetchRange,
  onSelectRange,
  selectedKey,
}: {
  availableYears: ReadonlyArray<number>;
  onPrefetchRange?: (key: StatsRangeKey) => void;
  onSelectRange: (key: StatsRangeKey) => void;
  selectedKey: StatsRangeKey;
}) {
  const isYearSelected = selectedKey !== 'all' && selectedKey !== 'week' && selectedKey !== 'month';

  const handleMenuWarmup = () => {
    for (const year of availableYears.slice(0, 4)) {
      onPrefetchRange?.(`${year}`);
    }
  };

  return (
    <div className="stats__toolbar">
      <MusicNav current={musicStatsRoute} />
      <fieldset aria-label="Time range" className="paperPills stats__rangePills" {...jsOnlyProps}>
        {QUICK_RANGE_OPTIONS.map((option) => {
          const current = option.key === selectedKey;
          return (
            <PaperTag
              className={cx('paperPill', current && 'paperButtonCurrent')}
              edge="quad-a"
              key={option.key}
              tiltDeg={option.tiltDeg}
            >
              <button
                aria-pressed={current}
                className="paperPillButton"
                onClick={() => onSelectRange(option.key)}
                onMouseEnter={() => onPrefetchRange?.(option.key)}
                type="button"
              >
                {option.label}
              </button>
            </PaperTag>
          );
        })}
        {availableYears.length > 0 ? (
          <YearMenu
            onPick={(year) => onSelectRange(`${year}`)}
            onPrefetch={(year) => onPrefetchRange?.(`${year}`)}
            onWarmup={handleMenuWarmup}
            selected={isYearSelected ? Number(selectedKey) : null}
            years={availableYears}
          />
        ) : null}
      </fieldset>
    </div>
  );
}
