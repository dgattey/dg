import type { HTMLAttributes } from 'react';
import type { SxObject, SxProps } from '../theme';
import { compileSx, joinClasses, SxStyle } from '../theme/css';

type SkeletonVariant = 'text' | 'rounded';

type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  height?: number | string;
  sx?: SxProps;
  variant?: SkeletonVariant;
  width?: number | string;
};

export function Skeleton({
  className,
  height,
  sx,
  variant = 'text',
  width,
  ...rest
}: SkeletonProps) {
  const radius = variant === 'rounded' ? '8px' : '4px';

  const baseSx: SxObject = {
    animation: 'dg-pulse 2s ease-in-out 0.5s infinite',
    backgroundColor: 'var(--dg-skeleton-bg, rgba(128, 128, 128, 0.12))',
    borderRadius: radius,
    display: 'block',
    height: height ?? (variant === 'text' ? '1.2em' : 'auto'),
    ...(width !== undefined ? { width } : {}),
  };
  const mergedSx: SxProps = Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
  const compiled = compileSx(mergedSx);

  return (
    <>
      <SxStyle compiled={compiled} />
      <span
        aria-hidden="true"
        className={joinClasses(compiled?.className, className)}
        data-skeleton=""
        {...rest}
      />
    </>
  );
}
