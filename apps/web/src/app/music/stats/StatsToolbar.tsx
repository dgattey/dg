'use client';

import type { StatsRangeKey } from '@dg/shared-core/dates/statsRange';
import { musicStatsRoute } from '@dg/shared-core/routes/app';
import { type PaperPillOption, PaperPills } from '../../collage/PaperPills';
import { YearMenu } from '../../collage/YearMenu';
import { MusicNav } from '../MusicNav';

type QuickRangeKey = 'all' | 'month' | 'week';

const QUICK_RANGE_OPTIONS: ReadonlyArray<PaperPillOption<QuickRangeKey>> = [
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
      <PaperPills
        className="stats__rangePills"
        label="Time range"
        onPrefetch={onPrefetchRange}
        onSelect={onSelectRange}
        options={QUICK_RANGE_OPTIONS}
        selected={isYearSelected ? null : selectedKey}
      >
        {availableYears.length > 0 ? (
          <YearMenu
            onPick={(year) => onSelectRange(`${year}`)}
            onPrefetch={(year) => onPrefetchRange?.(`${year}`)}
            onWarmup={handleMenuWarmup}
            selected={isYearSelected ? Number(selectedKey) : null}
            years={availableYears}
          />
        ) : null}
      </PaperPills>
    </div>
  );
}
