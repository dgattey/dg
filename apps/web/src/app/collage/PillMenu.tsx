'use client';

import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { bindHoverMenu } from './hoverMenu';
import { PaperCard } from './PaperCard';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';

const bindPillMenu = (node: HTMLDetailsElement | null) =>
  bindHoverMenu(node, 'button[data-menu-option]');

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
    <details
      className={cx('chrome__music pillMenu', className)}
      onPointerEnter={onWarmup}
      ref={bindPillMenu}
    >
      <summary className="chrome__musicSummary pillMenu__summary collageLift">
        <PaperTag
          className={cx('paperPill', current && 'paperButtonCurrent')}
          edge="quad-a"
          tiltDeg={tiltDeg}
        >
          <span className="paperPillButton pillMenu__face">
            {face}
            <ChevronDown aria-hidden={true} className="chrome__musicChevron" size={18} />
          </span>
        </PaperTag>
      </summary>
      <PaperCard
        className={cx('chrome__musicPanel pillMenu__panel', panelClassName)}
        edge="quad-a"
        innerClassName="chrome__musicPanelInner"
        tiltDeg={-1}
      >
        {children}
      </PaperCard>
    </details>
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
      onClick={onPick}
      onFocus={onPrefetch}
      onMouseEnter={onPrefetch}
      type="button"
    >
      {children}
    </button>
  );
}

/** Picks in a `PillMenu` panel, one per row. */
export function PillMenuList({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul aria-label={label} className="pillMenu__list">
      {children}
    </ul>
  );
}
