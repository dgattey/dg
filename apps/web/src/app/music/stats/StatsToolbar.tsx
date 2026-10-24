'use client';

import type { StatsRangeKey } from '@dg/services/spotify/fetchListeningStats';
import { musicStatsRoute } from '@dg/shared-core/routes/app';
import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import { ChevronDown } from 'lucide-react';
import { useRef } from 'react';
import { PaperCard } from '../../collage/PaperCard';
import { PaperTag } from '../../collage/PaperTag';
import { cx } from '../../collage/paperVars';
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

/**
 * Binds hover-open, outside-press close, Escape close, and arrow-key navigation
 * to the Year `<details>` dropdown menu.
 */
function bindYearMenu(details: HTMLDetailsElement | null) {
  const summary = details?.querySelector('summary');
  if (!details || !summary) {
    return;
  }
  let openedByHover = false;

  const setOpen = (open: boolean) => {
    details.open = open;
    openedByHover = false;
  };
  const hover = (open: boolean) => (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || details.open === open) {
      return;
    }
    if (open || openedByHover) {
      details.open = open;
      openedByHover = open;
    }
  };
  const enter = hover(true);
  const leave = hover(false);
  const keepHoverOpen = (event: MouseEvent) => {
    if (openedByHover) {
      event.preventDefault();
    }
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (!details.open) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      summary.focus();
      return;
    }
    const buttons = [...details.querySelectorAll<HTMLButtonElement>('button[data-year-option]')];
    if (buttons.length === 0) {
      return;
    }
    const activeIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    let nextIndex = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = activeIndex < 0 ? 0 : (activeIndex + 1) % buttons.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = activeIndex <= 0 ? buttons.length - 1 : (activeIndex - 1) % buttons.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = buttons.length - 1;
    }
    if (nextIndex >= 0) {
      event.preventDefault();
      buttons[nextIndex]?.focus();
    }
  };
  const closeOnOutsidePress = (event: PointerEvent) => {
    if (details.open && event.target instanceof Node && !details.contains(event.target)) {
      setOpen(false);
    }
  };

  details.addEventListener('pointerenter', enter);
  details.addEventListener('pointerleave', leave);
  details.addEventListener('keydown', onKeyDown);
  summary.addEventListener('click', keepHoverOpen);
  document.addEventListener('pointerdown', closeOnOutsidePress);
  return () => {
    details.removeEventListener('pointerenter', enter);
    details.removeEventListener('pointerleave', leave);
    details.removeEventListener('keydown', onKeyDown);
    summary.removeEventListener('click', keepHoverOpen);
    document.removeEventListener('pointerdown', closeOnOutsidePress);
  };
}

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
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const isYearSelected = selectedKey !== 'all' && selectedKey !== 'week' && selectedKey !== 'month';

  const setDetailsRef = (node: HTMLDetailsElement | null) => {
    detailsRef.current = node;
    return bindYearMenu(node);
  };

  const handleYearPick = (yearKey: StatsRangeKey) => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
    onSelectRange(yearKey);
  };

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
          <details
            className="chrome__music stats__yearMenu"
            onPointerEnter={handleMenuWarmup}
            ref={setDetailsRef}
          >
            <summary className="chrome__musicSummary stats__yearSummary collageLift">
              <PaperTag
                className={cx('paperPill', isYearSelected && 'paperButtonCurrent')}
                edge="quad-a"
                tiltDeg={1.5}
              >
                <span className="paperPillButton stats__yearSummaryFace">
                  {isYearSelected ? selectedKey : 'Year'}
                  <ChevronDown aria-hidden={true} className="chrome__musicChevron" size={18} />
                </span>
              </PaperTag>
            </summary>
            <PaperCard
              className="chrome__musicPanel stats__yearPanel"
              edge="quad-a"
              innerClassName="chrome__musicPanelInner"
              tiltDeg={-1}
            >
              <ul aria-label="Select year" className="stats__yearMenuGrid">
                {availableYears.map((year) => {
                  const yearKey: StatsRangeKey = `${year}`;
                  const current = selectedKey === yearKey;
                  return (
                    <li key={year}>
                      <button
                        aria-pressed={current}
                        className={cx(
                          'chrome__musicLink stats__yearOption',
                          current && 'stats__yearOption--current',
                        )}
                        data-year-option={year}
                        onClick={() => handleYearPick(yearKey)}
                        onFocus={() => onPrefetchRange?.(yearKey)}
                        onMouseEnter={() => onPrefetchRange?.(yearKey)}
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
        ) : null}
      </fieldset>
    </div>
  );
}
