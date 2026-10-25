'use client';

import type { TypographyVariant } from '@dg/ui/core/Typography';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { bindHoverMenu } from './hoverMenu';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';

const bindPillMenu = (itemSelector: string) => (node: HTMLDetailsElement | null) =>
  bindHoverMenu(node, itemSelector);

export function MenuChevron() {
  return <ChevronDown aria-hidden={true} className="chrome__musicChevron" size={18} />;
}

export function HoverMenu({
  children,
  className,
  itemSelector = 'a[href], button[data-menu-option]',
  onWarmup,
  panelClassName,
  panelTiltDeg = 0,
  summary,
  summaryClassName,
  summaryTypography,
  summaryTypographyXs,
}: {
  children: ReactNode;
  className?: string;
  itemSelector?: string;
  onWarmup?: () => void;
  panelClassName?: string;
  panelTiltDeg?: number;
  summary: ReactNode;
  summaryClassName?: string;
  summaryTypography?: TypographyVariant;
  summaryTypographyXs?: TypographyVariant;
}) {
  return (
    <details
      className={cx('chrome__music', className)}
      onPointerEnter={onWarmup}
      ref={bindPillMenu(itemSelector)}
    >
      <summary
        className={cx('chrome__musicSummary', summaryClassName)}
        data-typography={summaryTypography}
        data-typography-xs={summaryTypographyXs}
      >
        {summary}
      </summary>
      <PaperCard
        className={cx('chrome__musicPanel', panelClassName)}
        edge="quad-a"
        innerClassName="chrome__musicPanelInner"
        tiltDeg={panelTiltDeg}
      >
        {children}
      </PaperCard>
    </details>
  );
}

/**
 * A paper pill with a `▾` that opens a panel of picks on hover or click. The face
 * names the pick inside it once there is one, so the bar always shows what's applied.
 */
export function PillMenu({
  children,
  className,
  current,
  face,
  onWarmup,
  panelClassName,
  tiltDeg = 1.5,
}: {
  children: ReactNode;
  className?: string;
  /** True when the applied pick lives in this menu. */
  current: boolean;
  face: ReactNode;
  /** Called when the pointer first reaches the menu, before any pick is hovered. */
  onWarmup?: () => void;
  panelClassName?: string;
  tiltDeg?: number;
}) {
  return (
    <HoverMenu
      className={cx('pillMenu', className)}
      itemSelector="button[data-menu-option]"
      onWarmup={onWarmup}
      panelClassName={cx('pillMenu__panel', panelClassName)}
      panelTiltDeg={-1}
      summary={
        <PaperTag
          className={cx('paperPill', current && 'paperButtonCurrent')}
          data-typography-sm="meta"
          edge="quad-a"
          tiltDeg={tiltDeg}
        >
          <span className="paperPillButton pillMenu__face">
            {face}
            <MenuChevron />
          </span>
        </PaperTag>
      }
      summaryClassName="pillMenu__summary collageLift"
    >
      {children}
    </HoverMenu>
  );
}

/** One pick in a `PillMenu` panel. */
export function PillMenuOption({
  children,
  className,
  current,
  onPick,
  onPrefetch,
}: {
  children: ReactNode;
  className?: string;
  current: boolean;
  onPick: () => void;
  onPrefetch?: () => void;
}) {
  return (
    <button
      aria-pressed={current}
      className={cx(
        'chrome__musicLink pillMenu__option',
        current && 'pillMenu__option--current',
        className,
      )}
      data-menu-option={true}
      data-typography="label"
      onClick={onPick}
      onFocus={onPrefetch}
      onMouseEnter={onPrefetch}
      type="button"
    >
      {children}
    </button>
  );
}

/** Picks in a `HoverMenu` or `PillMenu` panel, one per row. */
export function PillMenuList({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <ul aria-label={label} className="chrome__musicList">
      {children}
    </ul>
  );
}
