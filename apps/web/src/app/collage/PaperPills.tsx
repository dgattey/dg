import { jsOnlyProps } from '@dg/ui/core/JsOnlyStyle';
import type { ReactNode } from 'react';
import { PaperTag } from './PaperTag';
import { cx } from './paperVars';

export type PaperPillOption<Key extends string> = {
  key: Key;
  label: ReactNode;
  tiltDeg: number;
};

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
            className={cx('paperPill', current && 'paperButtonCurrent')}
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
                {option.label}
              </button>
            ) : (
              <span className="paperPillButton">{option.label}</span>
            )}
          </PaperTag>
        );
      })}
      {children}
    </fieldset>
  );
}
