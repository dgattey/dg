import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import type { ReactNode } from 'react';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';

export type PaperPillOption<Key extends string> = {
  className?: string;
  key: Key;
  label: ReactNode;
  /** A tighter label for phones; screen readers keep hearing `label`. */
  shortLabel?: ReactNode;
  tiltDeg: number;
};

/** A label that tightens to `short` on phones while its accessible name stays `full`. */
export function PillLabel({ full, short }: { full: ReactNode; short?: ReactNode }) {
  if (short === undefined) {
    return full;
  }
  return (
    <>
      <span className="pillLabelFull">{full}</span>
      <span aria-hidden={true} className="pillLabelShort">
        {short}
      </span>
    </>
  );
}

/**
 * Sort and filter pills on collage index pages. Without `onSelect` the pills
 * render inert, as a loading placeholder that holds the same footprint.
 */
export function PaperPills<Key extends string>({
  children,
  className,
  label,
  onPrefetch,
  onSelect,
  options,
  selected,
}: {
  /** Trailing controls in the same group, such as a menu of further picks. */
  children?: ReactNode;
  className?: string;
  label: string;
  onPrefetch?: (key: Key) => void;
  onSelect?: (key: Key) => void;
  options: ReadonlyArray<PaperPillOption<Key>>;
  /** Null when the pick lives outside these pills. */
  selected: Key | null;
}) {
  return (
    <fieldset aria-label={label} className={cx('paperPills', className)} {...jsOnlyProps}>
      {options.map((option) => {
        const current = option.key === selected;
        return (
          <PaperTag
            className={cx('paperPill', current && 'paperButtonCurrent', option.className)}
            data-typography-sm="meta"
            edge="quad-a"
            key={option.key}
            tiltDeg={option.tiltDeg}
          >
            {onSelect ? (
              <button
                aria-pressed={current}
                className="paperPillButton"
                onClick={() => onSelect(option.key)}
                onFocus={onPrefetch ? () => onPrefetch(option.key) : undefined}
                onMouseEnter={onPrefetch ? () => onPrefetch(option.key) : undefined}
                type="button"
              >
                <PillLabel full={option.label} short={option.shortLabel} />
              </button>
            ) : (
              <span className="paperPillButton">
                <PillLabel full={option.label} short={option.shortLabel} />
              </span>
            )}
          </PaperTag>
        );
      })}
      {children}
    </fieldset>
  );
}

export type PaperStripOption<Key extends string> = {
  key: Key;
  label: ReactNode;
};

export function PaperStrip<Key extends string>({
  className,
  label,
  onSelect,
  options,
  selected,
}: {
  className?: string;
  label: string;
  onSelect: (key: Key) => void;
  options: ReadonlyArray<PaperStripOption<Key>>;
  selected: Key;
}) {
  return (
    <fieldset
      aria-label={label}
      className={cx('chrome__strip', 'collageLift', className)}
      {...jsOnlyProps}
    >
      {options.map((option) => {
        const current = option.key === selected;
        return (
          <button
            aria-pressed={current}
            className={cx('chrome__segment', current && 'chrome__segmentCurrent')}
            data-typography="label"
            data-typography-xs="caption"
            key={option.key}
            onClick={() => onSelect(option.key)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
