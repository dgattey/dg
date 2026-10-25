import type { CSSProperties, HTMLAttributes } from 'react';

type SkeletonVariant = 'text' | 'rounded';

type SkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, 'style'> & {
  height?: number | string;
  maxWidth?: number | string;
  variant?: SkeletonVariant;
  width?: number | string;
};

function toCssLength(val: number | string | undefined): string | undefined {
  if (val === undefined) return undefined;
  return typeof val === 'number' ? `${val}px` : val;
}

export function Skeleton({
  className,
  height,
  maxWidth,
  variant = 'text',
  width,
  ...rest
}: SkeletonProps) {
  const h = toCssLength(height);
  const maxW = toCssLength(maxWidth);
  const w = toCssLength(width);
  const vars: CSSProperties & Record<`--${string}`, string> = {};
  if (h) vars['--skeleton-h'] = h;
  if (maxW) vars['--skeleton-max-w'] = maxW;
  if (w) vars['--skeleton-w'] = w;

  return (
    <span
      aria-hidden="true"
      className={className}
      data-skeleton={variant === 'rounded' ? 'rounded' : ''}
      style={Object.keys(vars).length > 0 ? vars : undefined}
      {...rest}
    />
  );
}
