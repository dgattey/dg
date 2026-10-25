import type { ReactNode, Ref } from 'react';
import { cx } from './paperVars';

export type FilterBarVariant = 'default' | 'spread' | 'start' | 'stack';

/**
 * Sticky collage filter and sort bar. `variant` sets the bar's alignment and flow
 * across routes without leaking route-specific selectors into shared stylesheets.
 */
export function FilterBar({
  children,
  className,
  ref,
  variant = 'default',
}: {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  variant?: FilterBarVariant;
}) {
  return (
    <div className={cx('pillStrip', className)} data-filter-bar={variant} ref={ref}>
      {children}
    </div>
  );
}
